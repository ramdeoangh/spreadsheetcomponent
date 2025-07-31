# Render Backend Deployment Guide

This guide walks you through deploying your backend to Render, which provides excellent WebSocket support.

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
├── render.yaml
├── tsconfig.json
└── ...
```

### 2. Deploy to Render

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Create New Web Service**: Click "New +" → "Web Service"
3. **Connect Repository**: Connect your GitHub repository
4. **Configure Service**:
   - **Name**: `spreadsheet-backend` (or your preferred name)
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### 3. Environment Variables

Set these in Render dashboard under **Environment Variables**:

```env
# Server Configuration
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

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

Click "Create Web Service" and wait for the build to complete.

## 🔧 Configuration Files

### render.yaml (Optional)
The `backend/render.yaml` file provides a blueprint for deployment:

```yaml
services:
  - type: web
    name: spreadsheet-backend
    env: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3001
      # ... other environment variables
```

### package.json
The build and start scripts are configured:
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

## 🌐 Domain Configuration

After deployment, your backend will be available at:
- **Production**: `https://your-app-name.onrender.com`
- **Custom Domain**: You can add a custom domain in Render settings

## 🔗 Connecting Frontend

Update your frontend environment variables:

```env
# In Vercel frontend project settings
VITE_API_URL=https://your-app-name.onrender.com/api
VITE_WEBSOCKET_URL=https://your-app-name.onrender.com
```

## ✅ Render Advantages

### WebSocket Support
- **Full WebSocket support** with persistent connections
- **No cold starts** affecting real-time performance
- **State persistence** across requests
- **Better for real-time applications**

### Performance
- **Auto-scaling** based on traffic
- **Global CDN** for faster response times
- **SSL/TLS** automatically configured
- **Health checks** and automatic restarts

### Monitoring
- **Built-in logging** and monitoring
- **Performance metrics** and analytics
- **Error tracking** and alerting
- **Uptime monitoring**

## 🔍 Troubleshooting

### Build Errors
1. **TypeScript errors**: Check `tsconfig.json` configuration
2. **Missing dependencies**: Ensure all dependencies are in `package.json`
3. **Build timeout**: Optimize build process

### Runtime Errors
1. **Environment variables**: Verify all variables are set in Render
2. **CORS errors**: Check `CORS_ORIGIN` matches frontend domain
3. **Port issues**: Ensure `PORT` is set correctly

### Debug Steps
1. Check Render service logs
2. Test API endpoints manually
3. Verify environment variables
4. Check CORS configuration

## 📊 Monitoring

### Render Analytics
- **Request logs**: Monitor API usage
- **Response times**: Track performance
- **Error rates**: Identify issues
- **Uptime**: Service availability

### Custom Logging
Your application uses Winston for logging:
- Console logs in development
- Structured logging for production
- Error tracking and monitoring

## 🚀 Scaling

### Auto-scaling
- **Free tier**: 1 instance
- **Paid tiers**: Multiple instances with auto-scaling
- **Custom scaling**: Based on CPU/memory usage

### Performance Optimization
- **Caching**: Implement Redis for caching
- **Database**: Add managed database service
- **CDN**: Global content delivery

## 🔒 Security

### Environment Variables
- **Secure storage** of sensitive data
- **No exposure** in logs or code
- **Encrypted** at rest

### CORS Configuration
- **Specific origins** only
- **Credentials support** for authentication
- **Secure headers** with Helmet.js

## 📝 Example Deployment

### Backend (Render)
- **Domain**: `https://spreadsheet-backend.onrender.com`
- **Environment Variables**:
  ```env
  CORS_ORIGIN=https://my-spreadsheet-app.vercel.app
  NODE_ENV=production
  PORT=3001
  ```

### Frontend (Vercel)
- **Environment Variables**:
  ```env
  VITE_API_URL=https://spreadsheet-backend.onrender.com/api
  VITE_WEBSOCKET_URL=https://spreadsheet-backend.onrender.com
  ```

## 🚀 Next Steps

1. **Deploy backend** to Render
2. **Update frontend** environment variables
3. **Test the connection** between frontend and backend
4. **Monitor performance** and logs
5. **Scale as needed** based on usage

## 📞 Support

- **Render Documentation**: https://render.com/docs
- **Render Support**: https://render.com/support
- **Community**: Render Discord and forums 