# Deployment Guide

This guide explains how to deploy your spreadsheet application to production.

## 🚀 Frontend Deployment (Vercel)

### 1. Environment Variables Setup

Create a `.env.local` file in the `frontend` directory with your backend server URL:

```env
# Backend API URL (for HTTP requests)
VITE_API_URL=https://your-backend-domain.com/api

# Backend WebSocket URL (for real-time updates)
VITE_WEBSOCKET_URL=https://your-backend-domain.com
```

### 2. Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Vercel will automatically detect the configuration from `vercel.json`
4. Set the environment variables in Vercel dashboard:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add `VITE_API_URL` and `VITE_WEBSOCKET_URL` with your backend URLs

### 3. Vercel Configuration

The `vercel.json` file is already configured to:
- Use the `frontend` directory as root
- Build the project with `npm run build`
- Output to `dist` directory
- Handle client-side routing

## 🔧 Backend Deployment

### Option 1: Deploy to Render (Recommended)

Render provides excellent WebSocket support and is perfect for real-time applications.

1. **Prepare your backend**:
   ```bash
   cd backend
   npm install
   npm run build
   ```

2. **Deploy to Render**:
   - Go to https://dashboard.render.com
   - Create New Web Service
   - Connect your GitHub repository
   - Set Root Directory to `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

3. **Set environment variables in Render**:
   ```env
   NODE_ENV=production
   PORT=3001
   HOST=0.0.0.0
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   LOG_LEVEL=info
   ENABLE_CONSOLE_LOG=true
   ENABLE_FILE_LOG=false
   ```

4. **Render Advantages**:
   - Full WebSocket support with persistent connections
   - No cold starts affecting real-time performance
   - Auto-scaling based on traffic
   - Built-in monitoring and logging

### Option 2: Deploy to Vercel

1. **Prepare your backend**:
   ```bash
   cd backend
   npm install
   npm run build
   ```

2. **Deploy to Vercel**:
   - Create a new Vercel project for the backend
   - Connect your GitHub repository
   - Set the root directory to `backend`
   - Vercel will use the `backend/vercel.json` configuration

3. **Set environment variables in Vercel**:
   ```env
   PORT=3001
   HOST=0.0.0.0
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   LOG_LEVEL=info
   ENABLE_CONSOLE_LOG=true
   ENABLE_FILE_LOG=false
   ```

4. **Vercel Limitations**:
   - WebSocket connections may have cold starts
   - Function timeout limits (30-60 seconds)
   - State persistence limitations

### Option 3: Deploy to Railway/Heroku

1. **Prepare your backend**:
   ```bash
   cd backend
   npm install
   npm run build
   ```

2. **Set environment variables**:
   ```env
   PORT=3001
   HOST=0.0.0.0
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   LOG_LEVEL=info
   ENABLE_CONSOLE_LOG=true
   ENABLE_FILE_LOG=true
   ```

3. **Deploy to your preferred platform**:
   - **Railway**: Connect your GitHub repo and deploy
   - **Heroku**: Use the Procfile and deploy

### Option 4: Deploy to VPS/Docker

1. **Build and run with Docker**:
   ```bash
   docker-compose up --build -d
   ```

2. **Or deploy manually**:
   ```bash
   cd backend
   npm install
   npm run build
   npm start
   ```

## 🔗 Connecting Frontend to Backend

### 1. Update Environment Variables

Once your backend is deployed, update your frontend environment variables:

```env
# Replace with your actual backend domain
VITE_API_URL=https://your-backend-domain.com/api
VITE_WEBSOCKET_URL=https://your-backend-domain.com
```

### 2. Update Backend CORS

Update your backend environment variables to allow your frontend domain:

```env
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

## 🌐 Domain Configuration

### For HTTPS (Recommended)

1. **Backend**: Use a service that provides HTTPS (Render, Vercel, Railway, etc.)
2. **Frontend**: Vercel automatically provides HTTPS
3. **WebSocket**: Ensure your backend supports WSS (secure WebSocket)

### For HTTP (Development Only)

If using HTTP in development:
```env
VITE_API_URL=http://your-backend-domain.com/api
VITE_WEBSOCKET_URL=http://your-backend-domain.com
```

## 🔍 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure `CORS_ORIGIN` in backend matches your frontend domain
2. **WebSocket Connection Failed**: Check if your backend supports WebSocket connections
3. **Environment Variables Not Loading**: Ensure variables are set in deployment platform
4. **Function Timeout**: Increase timeout or break down operations

### Debug Steps

1. Check browser console for connection errors
2. Verify backend is accessible via browser
3. Test WebSocket connection manually
4. Check environment variables are loaded correctly

## 📝 Example Deployment

### Frontend (Vercel)
- Domain: `https://my-spreadsheet-app.vercel.app`
- Environment Variables:
  ```env
  VITE_API_URL=https://my-backend.onrender.com/api
  VITE_WEBSOCKET_URL=https://my-backend.onrender.com
  ```

### Backend (Render)
- Domain: `https://my-backend.onrender.com`
- Environment Variables:
  ```env
  CORS_ORIGIN=https://my-spreadsheet-app.vercel.app
  ```

## 🚀 Quick Deploy Commands

```bash
# Frontend
cd frontend
npm install
npm run build

# Backend
cd backend
npm install
npm run build
npm start
```

## 📊 Monitoring

- **Frontend**: Vercel provides analytics and performance monitoring
- **Backend**: Use your platform's monitoring tools
- **Logs**: Check application logs for errors and performance issues

## 🔧 Platform-Specific Notes

### Render (Recommended for Backend)
- **Full WebSocket support** with persistent connections
- **No cold starts** affecting real-time performance
- **Auto-scaling** based on traffic
- **Built-in monitoring** and logging

### Vercel (Good for Frontend, Limited for Backend)
- **Excellent frontend deployment**
- **WebSocket limitations** for backend
- **Function timeout** constraints
- **Cold starts** may affect real-time performance 