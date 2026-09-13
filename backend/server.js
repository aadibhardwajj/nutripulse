require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database is empty (such as in local MongoMemoryServer mode)
    const Food = require('./models/Food');
    const foodCount = await Food.countDocuments();
    if (foodCount === 0) {
      console.log('Database empty. Running initial seed...');
      const { seedDatabase } = require('./database/seed');
      await seedDatabase();
    }

    const server = app.listen(PORT, () => {
      console.log(`========================================`);
      console.log(`  NutriPulse API Server Started         `);
      console.log(`  Port: http://localhost:${PORT}        `);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`========================================`);
    });

    // Graceful shutdown handling
    const shutdown = async () => {
      console.log('Shutting down server gracefully...');
      server.close(async () => {
        const { disconnectDB } = require('./config/db');
        await disconnectDB();
        console.log('Database disconnected. Process terminated.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
