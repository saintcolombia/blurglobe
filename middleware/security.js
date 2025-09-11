const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { validationResult } = require('express-validator');

// Rate limiting configurations
const createRateLimiter = (windowMs, max, message = 'Too many requests, please try again later') => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for admin users
      return req.user && req.user.role === 'admin';
    }
  });
};

// General API rate limiter
const apiLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests per window
  'Too many requests from this IP, please try again later'
);

// Strict rate limiter for authentication endpoints
const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts per window
  'Too many authentication attempts, please try again in 15 minutes'
);

// Registration rate limiter
const registerLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  3, // 3 registrations per hour
  'Too many registration attempts, please try again in an hour'
);

// Password reset rate limiter
const passwordResetLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  3, // 3 reset attempts per hour
  'Too many password reset attempts, please try again in an hour'
);

// Cart operations rate limiter
const cartLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  30, // 30 cart operations per minute
  'Too many cart operations, please slow down'
);

// Order placement rate limiter
const orderLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  5, // 5 orders per hour
  'Too many order attempts, please try again later'
);

// Helmet security configuration
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      workerSrc: ["'self'", "blob:"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Input validation handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  
  next();
};

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      // Add production domains here
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
};

// Sanitize input middleware
const sanitizeInput = (req, res, next) => {
  // Remove any potential XSS characters
  const sanitize = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key]
          .replace(/[<>]/g, '') // Remove < and > characters
          .trim(); // Remove leading/trailing whitespace
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };
  
  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);
  
  next();
};

// Request logging middleware (for security monitoring)
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request details
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} - IP: ${req.ip} - User-Agent: ${req.get('User-Agent')}`);
  
  // Log response time
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

// IP blocking middleware (for suspicious activities)
const blockedIPs = new Set();

const ipBlocker = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  
  if (blockedIPs.has(clientIP)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }
  
  next();
};

// Function to block IP
const blockIP = (ip, duration = 24 * 60 * 60 * 1000) => {
  blockedIPs.add(ip);
  
  // Automatically unblock after duration
  setTimeout(() => {
    blockedIPs.delete(ip);
    console.log(`IP ${ip} has been unblocked`);
  }, duration);
  
  console.log(`IP ${ip} has been blocked for ${duration}ms`);
};

// Suspicious activity detector
const suspiciousActivityDetector = (req, res, next) => {
  const suspiciousPatterns = [
    /(\<script\>)/i,
    /(\<\/script\>)/i,
    /(javascript\:)/i,
    /(onload\=)/i,
    /(onerror\=)/i,
    /(\<iframe)/i,
    /(eval\()/i,
    /(document\.cookie)/i,
    /(document\.write)/i,
    /(\bunion\b.*\bselect\b)/i,
    /(\bselect\b.*\bfrom\b)/i,
    /(\bdrop\b.*\btable\b)/i,
    /(\binsert\b.*\binto\b)/i,
    /(\bdelete\b.*\bfrom\b)/i
  ];
  
  const checkForSuspiciousContent = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        for (let pattern of suspiciousPatterns) {
          if (pattern.test(obj[key])) {
            console.warn(`Suspicious activity detected from IP ${req.ip}: ${obj[key]}`);
            return true;
          }
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (checkForSuspiciousContent(obj[key])) {
          return true;
        }
      }
    }
    return false;
  };
  
  let suspiciousFound = false;
  if (req.body) suspiciousFound = checkForSuspiciousContent(req.body);
  if (!suspiciousFound && req.query) suspiciousFound = checkForSuspiciousContent(req.query);
  if (!suspiciousFound && req.params) suspiciousFound = checkForSuspiciousContent(req.params);
  
  if (suspiciousFound) {
    blockIP(req.ip);
    return res.status(403).json({
      success: false,
      message: 'Suspicious activity detected'
    });
  }
  
  next();
};

module.exports = {
  // Rate limiters
  apiLimiter,
  authLimiter,
  registerLimiter,
  passwordResetLimiter,
  cartLimiter,
  orderLimiter,
  
  // Security middleware
  securityHeaders,
  handleValidationErrors,
  corsOptions,
  sanitizeInput,
  requestLogger,
  ipBlocker,
  suspiciousActivityDetector,
  
  // Utility functions
  blockIP,
  createRateLimiter
};
