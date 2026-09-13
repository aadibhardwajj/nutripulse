const mongoose = require('mongoose');

let cachedConnection = null;
let cachedPromise = null;
let memoryServer = null;

const connectDB = async () => {
  // If already connected, reuse existing connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If currently in the process of connecting, wait for it
  if (mongoose.connection.readyState === 2 && cachedPromise) {
    return await cachedPromise;
  }

  // Otherwise reset stale cache
  cachedPromise = null;
  cachedConnection = null;

  const mongoURI = process.env.MONGODB_URI;
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

  // In production / deployed Vercel environments, MONGODB_URI is strictly required
  if (isProduction) {
    if (!mongoURI || mongoURI.includes('<username>')) {
      const errorMsg = 'FATAL: MONGODB_URI is required in production / deployed environment. Fallback database is disabled.';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
  }

  const connectionOptions = {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    connectTimeoutMS: 15000,
  };

  try {
    if (mongoURI && !mongoURI.includes('<username>')) {
      console.log('Connecting to MongoDB Atlas / Remote database...');
      cachedPromise = mongoose.connect(mongoURI, connectionOptions);
      const conn = await cachedPromise;
      cachedConnection = conn;
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    }

    // Fallback ONLY for explicitly local offline development
    console.log('No valid MONGODB_URI found. Initializing MongoMemoryServer for local offline session...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    if (!memoryServer) {
      memoryServer = await MongoMemoryServer.create();
    }
    const memUri = memoryServer.getUri();
    cachedPromise = mongoose.connect(memUri, connectionOptions).then((conn) => {
      cachedConnection = conn;
      console.log(`Connected to Local MongoMemoryServer instance: ${memUri}`);
      return conn;
    });
    return await cachedPromise;
  } catch (error) {
    cachedPromise = null;
    cachedConnection = null;
    console.error(`MongoDB Connection Error: ${error.message}`);
    // In local dev only, attempt fallback if remote Atlas connection failed
    if (!isProduction && !memoryServer) {
      try {
        console.warn('Falling back to local MongoMemoryServer for development...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        memoryServer = await MongoMemoryServer.create();
        const memUri = memoryServer.getUri();
        cachedPromise = mongoose.connect(memUri, connectionOptions).then((conn) => {
          cachedConnection = conn;
          console.log(`Connected to Fallback MongoMemoryServer: ${memUri}`);
          return conn;
        });
        return await cachedPromise;
      } catch (memErr) {
        console.error('MongoMemoryServer fallback failed:', memErr.message);
        throw error;
      }
    }
    throw error;
  }
};

const disconnectDB = async () => {
  cachedPromise = null;
  cachedConnection = null;
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
};

module.exports = { connectDB, disconnectDB };
