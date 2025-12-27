-- Create deployments table
CREATE TABLE public.deployments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    clone_id UUID REFERENCES public.clones(id) ON DELETE CASCADE NOT NULL,
    provider TEXT NOT NULL,
    deployment_url TEXT,
    deployment_id TEXT,
    status TEXT DEFAULT 'pending',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes
CREATE INDEX idx_deployments_project_id ON public.deployments(project_id);
CREATE INDEX idx_deployments_clone_id ON public.deployments(clone_id);
CREATE INDEX idx_deployments_provider ON public.deployments(provider);
CREATE INDEX idx_deployments_status ON public.deployments(status);

-- Enable RLS
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own deployments"
    ON public.deployments FOR SELECT
    TO authenticated
    USING (
        project_id IN (
            SELECT id FROM public.projects 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create deployments for their projects"
    ON public.deployments FOR INSERT
    TO authenticated
    WITH CHECK (
        project_id IN (
            SELECT id FROM public.projects 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own deployments"
    ON public.deployments FOR UPDATE
    TO authenticated
    USING (
        project_id IN (
            SELECT id FROM public.projects 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own deployments"
    ON public.deployments FOR DELETE
    TO authenticated
    USING (
        project_id IN (
            SELECT id FROM public.projects 
            WHERE user_id = auth.uid()
        )
    );

-- Add updated_at trigger
CREATE TRIGGER update_deployments_updated_at
    BEFORE UPDATE ON public.deployments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();