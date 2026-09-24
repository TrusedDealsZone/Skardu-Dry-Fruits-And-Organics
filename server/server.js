import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import settingsRoutes from './routes/settings.js';
import categoriesRoutes from './routes/categories.js';
import uploadRoutes from './routes/upload.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration supporting Vercel, Render, Namecheap domains, or localhost
const customOrigins = process.env.CLIENT_URL && process.env.CLIENT_URL !== '*'
  ? process.env.CLIENT_URL.split(',').map(s => s.trim())
  : null;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (!customOrigins) return callback(null, true);
    if (customOrigins.includes(origin)) return callback(null, true);
    if (/\.vercel\.app$/.test(origin) || /\.onrender\.com$/.test(origin) || /localhost/.test(origin)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/settings/categories', categoriesRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: 'mongodb',
    time: new Date().toISOString()
  });
});

// Serve frontend build in production
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

import Product from './models/Product.js';
import Category from './models/Category.js';
import Settings from './models/Settings.js';
import User from './models/User.js';

// Auto-seed function if DB is empty
async function autoSeedIfEmpty() {
  try {
    const productCount = await Product.countDocuments({});
    if (productCount === 0) {
      console.log('🔄 No products found in MongoDB. Auto-seeding initial database...');
      let backupPath = path.join(__dirname, 'data.json.backup');
      if (!fs.existsSync(backupPath)) {
        backupPath = path.join(__dirname, 'data.json');
      }
      if (fs.existsSync(backupPath)) {
        const raw = fs.readFileSync(backupPath, 'utf8');
        const data = JSON.parse(raw);

        if (Array.isArray(data.products) && data.products.length > 0) {
          await Product.insertMany(data.products);
          console.log(`✅ Auto-seeded ${data.products.length} products`);
        }
        if (Array.isArray(data.categories) && data.categories.length > 0) {
          for (const c of data.categories) {
            await Category.findOneAndUpdate({ name: c.name }, c, { upsert: true });
          }
        }
        if (data.settings) {
          await Settings.deleteMany({});
          await Settings.create(data.settings);
        }
        if (Array.isArray(data.users) && data.users.length > 0) {
          for (const u of data.users) {
            await User.findOneAndUpdate({ email: u.email.toLowerCase() }, u, { upsert: true });
          }
        }
      }
    }
  } catch (err) {
    console.error('Auto-seed warning:', err.message);
  }
}

// Start Server after connecting to MongoDB
export async function startServer() {
  await connectDB();
  await autoSeedIfEmpty();
  return app.listen(PORT, '0.0.0.0', () => {
    console.log(`=================================================`);
    console.log(`🚀 Dryfruits Server running at http://localhost:${PORT}`);
    console.log(`📦 Database: MongoDB Atlas / Local`);
    console.log(`=================================================`);
  });
}

startServer().catch(err => {
  console.error('Fatal server startup error:', err);
});

export default app;
