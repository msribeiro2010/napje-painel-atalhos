#!/bin/bash

# Deploy script for Railway
echo "🚀 Deploying PJe API to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway (if not already logged in)
echo "🔐 Checking Railway authentication..."
railway login

# Create new project or link existing
echo "📦 Setting up Railway project..."
railway link

# Set environment variables
echo "🔧 Setting environment variables..."
railway variables set NODE_ENV=production
railway variables set PORT=3001

# Deploy
echo "🚀 Deploying to Railway..."
railway up

echo "✅ Deployment completed!"
echo "📋 Next steps:"
echo "1. Set your PJe database environment variables in Railway dashboard"
echo "2. Update VITE_PJE_API_URL in Vercel to point to your Railway URL"
echo "3. Test the integration"