#!/bin/bash

# Setup Environment Variables for Deployment
echo "🚀 Setting up environment variables for deployment..."

# Frontend environment setup
echo "📝 Creating frontend environment file..."
cat > frontend/.env.local << EOF
# Backend API URL (for HTTP requests)
VITE_API_URL=https://your-backend-domain.com/api

# Backend WebSocket URL (for real-time updates)
VITE_WEBSOCKET_URL=https://your-backend-domain.com
EOF

echo "✅ Frontend environment file created: frontend/.env.local"
echo "⚠️  Remember to update the URLs with your actual backend domain!"

# Backend environment setup
echo "📝 Creating backend environment file..."
cat > backend/.env << EOF
# Server Configuration
PORT=3001
HOST=0.0.0.0
NODE_ENV=production

# CORS Configuration
CORS_ORIGIN=https://your-frontend-domain.vercel.app

# Logging Configuration
LOG_LEVEL=info
ENABLE_CONSOLE_LOG=true
ENABLE_FILE_LOG=true

# Database Configuration (for future use)
DATABASE_URL=mongodb://localhost:27017/spreadsheet-app

# API Configuration
API_RATE_LIMIT_WINDOW_MS=900000
API_RATE_LIMIT_MAX=100
EOF

echo "✅ Backend environment file created: backend/.env"
echo "⚠️  Remember to update CORS_ORIGIN with your actual frontend domain!"

echo ""
echo "🎯 Next steps:"
echo "1. Update the URLs in the environment files with your actual domains"
echo "2. Deploy backend to your preferred platform (Railway, Render, etc.)"
echo "3. Deploy frontend to Vercel"
echo "4. Set environment variables in Vercel dashboard"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions" 