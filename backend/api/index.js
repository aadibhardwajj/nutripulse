require('dotenv').config();
const app = require('../app');
const { connectDB } = require('../config/db');

// Serverless handler for Vercel
module.exports = async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error('Serverless DB connection error:', error);
    return res.status(500).json({
      success: false,
      message: 'Database connection failed in serverless function',
      code: 'DATABASE_CONNECTION_ERROR',
    });
  }
};
