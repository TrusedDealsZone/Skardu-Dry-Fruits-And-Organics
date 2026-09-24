import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skardu_dryfruits';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    // Don't crash immediately on Render free tier or temporary network blips; allow retry
  }
};

mongoose.connection.on('error', (err) => {
  console.error(`⚠️ MongoDB runtime error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected. Attempting reconnection...');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected successfully.');
});

export default connectDB;
