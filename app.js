const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const indexRoutes = require('./routes/index.routes');
const globalErrorHandler = require('./middlewares/error.middleware');
const AppError = require('./utils/appError');

const app = express();

// Global Middlewares
app.use(helmet()); // Secure HTTP headers
app.use(cors());
app.use(morgan('dev')); // Request logging
app.use(express.json({ limit: '10kb' })); // Body parser
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Rate limiting to prevent brute-force attacks
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// API Routes
app.use('/api', indexRoutes);

// Health probe endpoint for Azure / CI CD deployments
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Healthy', timestamp: new Date().toISOString() });
});

// 404 handler
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handling Middleware
app.use(globalErrorHandler);

module.exports = app;
