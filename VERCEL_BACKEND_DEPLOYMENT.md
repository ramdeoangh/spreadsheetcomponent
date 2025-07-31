# Vercel Backend Deployment Guide

This guide walks you through deploying your backend to Vercel.

## 🚀 Quick Setup

### 1. Prepare Your Repository

Ensure your backend is in the `backend` directory with the following structure:
```
backend/
├── src/
│   ├── index.ts
│   ├── server.ts
│   └── ...
├── package.json
├── vercel.json
├── tsconfig.json
└── ...
```

### 2. Deploy to Vercel

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Create New Project**: Click "New Project"
3. **Import Repository**: Connect your GitHub repository
4. **Configure Project**:
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 3. Environment Variables

Set these in Vercel dashboard under **Project Settings > Environment Variables**:

```env
# Server Configuration
PORT=3001
HOST=0.0.0.0
NODE_ENV=production

# CORS Configuration (update with your frontend domain)
CORS_ORIGIN=https://your-frontend-domain.vercel.app

# Logging Configuration
LOG_LEVEL=info
ENABLE_CONSOLE_LOG=true
ENABLE_FILE_LOG=false

# API Configuration
API_RATE_LIMIT_WINDOW_MS=900000
API_RATE_LIMIT_MAX=100
```

### 4. Deploy

Click "Deploy" and wait for the build to complete.

## 🔧 Configuration Files

### vercel.json
The `backend/vercel.json` file is already configured:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "dist/index.js"
    },
    {
      "src": "/socket.io/(.*)",
      "dest": "dist/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "dist/index.js"
    }
  ],
  "functions": {
    "dist/index.js": {
      "maxDuration": 30
    }
  },
  "env": {
    "NODE_ENV": "production"
  }
}
```

### package.json
The build script is configured:
```json
{
  "scripts": {
    "build": "tsc",
    "vercel-build": "npm run build"
  }
}
```

## 🌐 Domain Configuration

After deployment, your backend will be available at:
- **Production**: `https://your-project-name.vercel.app`
- **Preview**: `https://your-project-name-git-branch.vercel.app`

## 🔗 Connecting Frontend

Update your frontend environment variables:

```env
# In Vercel frontend project settings
VITE_API_URL=https://your-backend-project.vercel.app/api
VITE_WEBSOCKET_URL=https://your-backend-project.vercel.app
```

## ⚠️ Important Notes

### WebSocket Limitations
Vercel serverless functions have limitations with WebSocket connections:
- **Cold starts** may affect real-time performance
- **Connection timeouts** may occur
- **State persistence** is limited

### Alternatives for WebSocket
If you need full WebSocket support, consider:
1. **Railway**: Better for WebSocket applications
2. **Render**: Good WebSocket support
3. **Heroku**: Traditional hosting with WebSocket support

### Function Timeout
- Default timeout: 30 seconds
- Maximum timeout: 60 seconds (Pro plan)
- For long operations, consider breaking them down

## 🔍 Troubleshooting

### Build Errors
1. **TypeScript errors**: Check `tsconfig.json` configuration
2. **Missing dependencies**: Ensure all dependencies are in `package.json`
3. **Build timeout**: Optimize build process

### Runtime Errors
1. **Environment variables**: Verify all variables are set in Vercel
2. **CORS errors**: Check `CORS_ORIGIN` matches frontend domain
3. **WebSocket issues**: Consider alternative hosting for WebSocket

### Debug Steps
1. Check Vercel function logs
2. Test API endpoints manually
3. Verify environment variables
4. Check CORS configuration

## 📊 Monitoring

### Vercel Analytics
- **Function calls**: Monitor API usage
- **Response times**: Track performance
- **Error rates**: Identify issues

### Custom Logging
Your application uses Winston for logging:
- Console logs in development
- Structured logging for production
- Error tracking and monitoring

## 🚀 Next Steps

1. **Deploy backend** to Vercel
2. **Update frontend** environment variables
3. **Test the connection** between frontend and backend
4. **Monitor performance** and logs
5. **Scale as needed** based on usage

## 📞 Support

- **Vercel Documentation**: https://vercel.com/docs
- **Vercel Support**: https://vercel.com/support
- **Project Issues**: Check GitHub issues for common problems 