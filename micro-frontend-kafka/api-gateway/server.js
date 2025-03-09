const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:4000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token']
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// JWT verification middleware
const verifyToken = (req, res, next) => {
  const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Session data middleware - adds session info to all proxied requests
app.use((req, res, next) => {
  if (req.user) {
    // Add user info to headers for downstream services
    req.headers['x-user-id'] = req.user.id;
    req.headers['x-user-email'] = req.user.email;
  }
  next();
});

// Proxy routes
// Auth routes (direct to main app)
app.use('/api/auth', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/api/auth'
  },
  onProxyReq: (proxyReq, req, res) => {
    // Ensure cookies are forwarded
    if (req.cookies && req.cookies.token) {
      proxyReq.setHeader('Cookie', `token=${req.cookies.token}`);
    }
  }
}));

// Main App API
app.use('/api/main', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: {
    '^/api/main': '/api'
  }
}));

// Feature App API
app.use('/api/feature', verifyToken, createProxyMiddleware({
  target: 'http://localhost:3002',
  changeOrigin: true,
  pathRewrite: {
    '^/api/feature': '/api'
  }
}));

// Feature App Frontend
app.use('/feature', verifyToken, createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: {
    '^/feature': '/'
  },
  onProxyReq: (proxyReq, req, res) => {
    // Add session data to the proxied request
    if (req.user) {
      proxyReq.setHeader('x-user-id', req.user.id);
      proxyReq.setHeader('x-user-email', req.user.email);
    }
  }
}));

// Main App Frontend (this should be last as it's a catch-all)
app.use('/', createProxyMiddleware({
  target: 'http://localhost:3000',
  changeOrigin: true,
  ws: true,
}));

// Start the server
app.listen(PORT, () => {
  console.log(`API Gateway running on http://localhost:${PORT}`);
}); 