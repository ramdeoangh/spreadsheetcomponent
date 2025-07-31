# Spreadsheet Application - Production Grade

A production-ready React + TypeScript + Vite frontend with Express.js backend for an interactive spreadsheet application.

## 🚀 Features

- **Home Component**: Main container that binds the Spreadsheet and InputBox components
- **Spreadsheet Component**: Interactive spreadsheet simulator with real-time updates
- **InputBox Component**: User input interface with command parsing
- **Express.js Backend**: Production-grade REST API with security, logging, and error handling
- **Command Parsing**: Support for cell-specific commands (e.g., `A1 Hello World`, `B5 = 42`)

## 🏗️ Architecture

### Backend Architecture
```
backend/
├── src/
│   ├── config/           # Configuration management
│   ├── controllers/      # HTTP request handlers
│   ├── middleware/       # Express middleware (error handling, etc.)
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic layer
│   ├── utils/           # Utility functions (logging, etc.)
│   ├── types.ts         # TypeScript type definitions
│   ├── server.ts        # Server configuration
│   └── index.ts         # Application entry point
├── Dockerfile           # Production Docker configuration
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

### Frontend Architecture
```
frontend/
├── src/
│   ├── components/      # React components
│   ├── services/        # API communication
│   ├── utils/          # Utility functions
│   ├── types.ts        # TypeScript definitions
│   └── App.tsx         # Main application
├── Dockerfile          # Production Docker configuration
└── package.json        # Dependencies and scripts
```

## 🛠️ Tech Stack

### Backend
- **Express.js** with TypeScript
- **Winston** for structured logging
- **Helmet** for security headers
- **Rate Limiting** for API protection
- **CORS** configuration
- **Error Handling** middleware
- **Environment** configuration

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Axios** for HTTP requests with interceptors
- **Modern CSS** with responsive design

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Docker (optional, for containerized deployment)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd utility
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**
   ```bash
   cd ../backend
   cp env.example .env
   # Edit .env with your configuration
   ```

## 🚀 Running the Application

### Development Mode

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   The backend will run on http://localhost:3001

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on http://localhost:5173

### Production Mode

1. **Build and start backend**
   ```bash
   cd backend
   npm run build
   npm start
   ```

2. **Build and serve frontend**
   ```bash
   cd frontend
   npm run build
   npm run preview
   ```

### Docker Deployment

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

2. **Run in background**
   ```bash
   docker-compose up -d
   ```

3. **View logs**
   ```bash
   docker-compose logs -f
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=3001
HOST=localhost
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Logging Configuration
LOG_LEVEL=info
ENABLE_CONSOLE_LOG=true
ENABLE_FILE_LOG=false

# Database Configuration (for future use)
DATABASE_URL=mongodb://localhost:27017/spreadsheet-app

# API Configuration
API_RATE_LIMIT_WINDOW_MS=900000
API_RATE_LIMIT_MAX=100
```

## 📡 API Endpoints

### Base URL: `http://localhost:3001/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check endpoint |
| `POST` | `/message` | Send user message/command |
| `GET` | `/action` | Get action events |
| `GET` | `/state` | Get spreadsheet state |

### Command Examples

| Command | Description |
|---------|-------------|
| `A1 Hello World` | Updates cell A1 with "Hello World" |
| `B5 = 42` | Updates cell B5 with "42" |
| `C3 Test Message` | Updates cell C3 with "Test Message" |
| `Hello` | Updates cell A1 (default behavior) |

## 🔒 Security Features

- **Helmet.js** for security headers
- **Rate limiting** (100 requests per 15 minutes per IP)
- **CORS** configuration
- **Input validation** and sanitization
- **Error handling** without information leakage
- **Non-root Docker user**

## 📊 Logging

The application uses Winston for structured logging:

- **Console logging** in development
- **File logging** in production
- **Request/response logging**
- **Error tracking** with stack traces
- **Performance monitoring**

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

## 📈 Monitoring

### Health Check
```bash
curl http://localhost:3001/api/health
```

### Metrics
- Request count and response times
- Error rates
- Memory usage
- API endpoint usage

## 🚀 Deployment

### Docker Deployment
```bash
# Build and deploy
docker-compose up --build -d

# Scale backend
docker-compose up --scale backend=3 -d
```

### Manual Deployment
```bash
# Backend
cd backend
npm run build
NODE_ENV=production npm start

# Frontend
cd frontend
npm run build
# Serve dist/ folder with nginx or similar
```

## 🔧 Development Scripts

### Backend
```bash
npm run dev          # Development with hot reload
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run tests
npm run lint         # Lint code
npm run lint:fix     # Fix linting issues
```

### Frontend
```bash
npm run dev          # Development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
```

## 📁 Project Structure

```
utility/
├── backend/                 # Express.js backend
│   ├── src/
│   │   ├── config/         # Configuration management
│   │   ├── controllers/    # HTTP request handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utilities (logging, etc.)
│   │   ├── types.ts        # TypeScript types
│   │   ├── server.ts       # Server setup
│   │   └── index.ts        # Entry point
│   ├── Dockerfile          # Production Docker config
│   ├── package.json        # Dependencies
│   └── tsconfig.json       # TypeScript config
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   ├── utils/          # Utilities
│   │   ├── types.ts        # TypeScript types
│   │   └── App.tsx         # Main app
│   ├── Dockerfile          # Production Docker config
│   └── package.json        # Dependencies
├── docker-compose.yml      # Docker orchestration
└── README.md              # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.

## 🔄 Version History

- **v1.0.0** - Initial production release
  - Production-grade backend with security features
  - Structured logging and error handling
  - Docker support
  - Command parsing system
  - Real-time spreadsheet updates 