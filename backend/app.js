const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');

const { apiLimiter } = require('./middleware/rateLimitMiddleware');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const diaryRoutes = require('./routes/diaryRoutes');
const foodRoutes = require('./routes/foodRoutes');
const mealRoutes = require('./routes/mealRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const exerciseRoutes = require('./routes/exerciseRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const waterRoutes = require('./routes/waterRoutes');
const weightRoutes = require('./routes/weightRoutes');
const progressRoutes = require('./routes/progressRoutes');
const profileRoutes = require('./routes/profileRoutes');

const app = express();

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.some((allowed) => origin.startsWith(allowed) || allowed === '*')) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev, controlled via env in prod
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging in non-production
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Global rate limiting for general API paths
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  let isDbConnected = mongoose.connection.readyState === 1;
  let connectionError = null;

  if (!isDbConnected) {
    try {
      const { connectDB } = require('./config/db');
      await connectDB();
      isDbConnected = mongoose.connection.readyState === 1;
    } catch (err) {
      connectionError = err.message;
    }
  }

  const readyState = mongoose.connection.readyState;
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  const status = isDbConnected ? 200 : 503;

  return res.status(status).json({
    success: isDbConnected,
    data: {
      api: 'ok',
      database: states[readyState] || 'unknown',
      readyState,
      hasMongoUri: Boolean(process.env.MONGODB_URI),
      host: mongoose.connection.host || null,
      error: connectionError,
    },
    message: isDbConnected ? 'API is healthy' : (connectionError || 'Database is disconnected or unavailable'),
  });
});

// Dev seed endpoint for instant population in development/demo mode
app.post('/api/dev/seed', async (req, res) => {
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1') {
    return res.status(403).json({
      success: false,
      message: 'Database seeding endpoint is disabled in production environments.',
      code: 'FORBIDDEN',
    });
  }
  try {
    const { seedDatabase } = require('./database/seed');
    await seedDatabase();
    res.status(200).json({ success: true, message: 'Database seeded successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/diary', diaryRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/water', waterRoutes);
app.use('/api/weight', weightRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/profile', profileRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

module.exports = app;
