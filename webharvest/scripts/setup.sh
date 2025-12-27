#!/bin/bash

# WebHarvest Setup Script
# Automated setup for development and production environments

set -e

echo "🚀 WebHarvest Setup Script"
echo "=========================="

# Check for required commands
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed. Aborting." >&2; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose is required but not installed. Aborting." >&2; exit 1; }

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    
    # Generate secure random passwords
    POSTGRES_PASSWORD=$(openssl rand -base64 32)
    JWT_SECRET=$(openssl rand -base64 32)
    WEBHOOK_SECRET=$(openssl rand -base64 24)
    WEBUI_SECRET=$(openssl rand -base64 24)
    
    # Update .env with generated passwords (for macOS and Linux compatibility)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/your_secure_password_here/$POSTGRES_PASSWORD/g" .env
        sed -i '' "s/your_jwt_secret_key_32_chars_minimum/$JWT_SECRET/g" .env
        sed -i '' "s/your_webhook_secret_key/$WEBHOOK_SECRET/g" .env
        sed -i '' "s/your_openwebui_secret_key/$WEBUI_SECRET/g" .env
    else
        # Linux
        sed -i "s/your_secure_password_here/$POSTGRES_PASSWORD/g" .env
        sed -i "s/your_jwt_secret_key_32_chars_minimum/$JWT_SECRET/g" .env
        sed -i "s/your_webhook_secret_key/$WEBHOOK_SECRET/g" .env
        sed -i "s/your_openwebui_secret_key/$WEBUI_SECRET/g" .env
    fi
    
    echo "✅ Generated secure passwords and secrets"
else
    echo "ℹ️  .env file already exists, skipping..."
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p data/{screenshots,ssl,logs}
mkdir -p config

# Pull Docker images
echo "🐳 Pulling Docker images..."
docker-compose pull

# Build custom images
echo "🔨 Building WebHarvest services..."
docker-compose build

# Start services
echo "🎯 Starting WebHarvest services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check service health
echo "🔍 Checking service health..."
docker-compose ps

# Test API health endpoint
echo "🏥 Testing API health endpoint..."
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if curl -f http://localhost:8080/healthz 2>/dev/null; then
        echo ""
        echo "✅ API is healthy!"
        break
    fi
    attempt=$((attempt + 1))
    echo -n "."
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    echo ""
    echo "⚠️  API health check timed out. Please check the logs:"
    echo "   docker-compose logs webharvest-api"
fi

echo ""
echo "🎉 WebHarvest Setup Complete!"
echo "============================="
echo ""
echo "📍 Service URLs:"
echo "   - API: http://localhost:8080"
echo "   - API Docs: http://localhost:8080/docs"
echo "   - Open WebUI: http://localhost:3000"
echo "   - Qdrant: http://localhost:6333"
echo ""
echo "🔑 Default test API key: wh_test_key_123456789"
echo "   (For production, generate new API keys)"
echo ""
echo "📚 Next steps:"
echo "   1. Open http://localhost:3000 to access Open WebUI"
echo "   2. Test the API at http://localhost:8080/docs"
echo "   3. Configure MCP in Open WebUI settings"
echo ""
echo "📝 View logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Stop services:"
echo "   docker-compose down"