import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import app, { startServer } from './server.js';

dotenv.config();

export { app, connectDB, startServer };
export default app;
