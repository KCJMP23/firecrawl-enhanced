-- Create usage analytics table
CREATE TABLE IF NOT EXISTS usage_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    feature TEXT NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    cost DECIMAL(10, 6) DEFAULT 0,
    credits_used INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_usage_analytics_user_id ON usage_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_feature ON usage_analytics(feature);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_created_at ON usage_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_user_date ON usage_analytics(user_id, created_at);

-- Create credit purchases table
CREATE TABLE IF NOT EXISTS credit_purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    credits_amount INTEGER NOT NULL,
    price_amount INTEGER NOT NULL, -- in cents
    stripe_session_id TEXT UNIQUE,
    stripe_payment_intent_id TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'canceled')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_credit_purchases_user_id ON credit_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_status ON credit_purchases(status);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_stripe_session ON credit_purchases(stripe_session_id);

-- Add new columns to profiles table for credit management
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS credits_balance INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS credits_used_this_month INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS subscription_reset_date TIMESTAMPTZ DEFAULT DATE_TRUNC('month', NOW() + INTERVAL '1 month');

-- Create RLS policies
ALTER TABLE usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_purchases ENABLE ROW LEVEL SECURITY;

-- Usage analytics policies
CREATE POLICY "Users can view their own usage analytics" ON usage_analytics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage analytics" ON usage_analytics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Credit purchases policies
CREATE POLICY "Users can view their own credit purchases" ON credit_purchases
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage credit purchases" ON credit_purchases
    FOR ALL USING (true);

-- Function to reset monthly usage
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
    UPDATE profiles 
    SET credits_used_this_month = 0,
        subscription_reset_date = DATE_TRUNC('month', NOW() + INTERVAL '1 month')
    WHERE subscription_reset_date <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to reset monthly usage (requires pg_cron extension)
-- SELECT cron.schedule('reset-monthly-usage', '0 0 1 * *', 'SELECT reset_monthly_usage();');

-- Function to track credit usage
CREATE OR REPLACE FUNCTION track_credit_usage()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user's monthly usage when new usage analytics is inserted
    UPDATE profiles 
    SET credits_used_this_month = credits_used_this_month + COALESCE(NEW.credits_used, 0)
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic credit tracking
DROP TRIGGER IF EXISTS trigger_track_credit_usage ON usage_analytics;
CREATE TRIGGER trigger_track_credit_usage
    AFTER INSERT ON usage_analytics
    FOR EACH ROW
    EXECUTE FUNCTION track_credit_usage();

-- Function to add purchased credits to user balance
CREATE OR REPLACE FUNCTION add_purchased_credits()
RETURNS TRIGGER AS $$
BEGIN
    -- Add credits to user balance when purchase is completed
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE profiles 
        SET credits_balance = credits_balance + NEW.credits_amount
        WHERE id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic credit addition
DROP TRIGGER IF EXISTS trigger_add_purchased_credits ON credit_purchases;
CREATE TRIGGER trigger_add_purchased_credits
    AFTER UPDATE ON credit_purchases
    FOR EACH ROW
    EXECUTE FUNCTION add_purchased_credits();