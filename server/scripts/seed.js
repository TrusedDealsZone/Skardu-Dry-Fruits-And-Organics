import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import Settings from '../models/Settings.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedData() {
  try {
    console.log('🌱 Starting MongoDB Atlas / Local Database Seed...');
    await connectDB();

    // Locate backup data
    let backupPath = path.join(__dirname, '../data.json.backup');
    if (!fs.existsSync(backupPath)) {
      backupPath = path.join(__dirname, '../data.json');
    }

    if (!fs.existsSync(backupPath)) {
      throw new Error(`Data file not found at ${backupPath}`);
    }

    const raw = fs.readFileSync(backupPath, 'utf8');
    const data = JSON.parse(raw);

    // 1. Seed Users & Default Admin
    console.log('👤 Seeding Users...');
    if (Array.isArray(data.users)) {
      for (const u of data.users) {
        await User.findOneAndUpdate(
          { email: u.email.toLowerCase() },
          {
            id: u.id,
            name: u.name,
            email: u.email.toLowerCase(),
            phone: u.phone || '',
            password: u.password,
            role: u.role || 'customer'
          },
          { upsert: true, new: true }
        );
      }
    }

    // Ensure default required admin: admin@skardu.com / admin123
    const defaultAdminEmail = 'admin@skardu.com';
    const adminExists = await User.findOne({ email: defaultAdminEmail });
    if (!adminExists) {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync('admin123', salt);
      await User.create({
        id: 'u-admin-default',
        name: 'Skardu Store Administrator',
        email: defaultAdminEmail,
        phone: '+923202822332',
        password: hashedPassword,
        role: 'admin'
      });
      console.log(`✅ Created default admin account: ${defaultAdminEmail} / admin123`);
    } else {
      console.log(`ℹ️ Default admin account ${defaultAdminEmail} already exists`);
    }

    // 2. Seed Categories
    console.log('🏷️ Seeding Categories...');
    if (Array.isArray(data.categories)) {
      for (const c of data.categories) {
        await Category.findOneAndUpdate(
          { name: c.name },
          {
            id: c.id,
            name: c.name,
            icon: c.icon || '🌰',
            description: c.description || ''
          },
          { upsert: true, new: true }
        );
      }
    }

    // 3. Seed Products
    console.log('📦 Seeding Products...');
    if (Array.isArray(data.products)) {
      for (const p of data.products) {
        await Product.findOneAndUpdate(
          { id: p.id },
          {
            id: p.id,
            name: p.name || p.title,
            title: p.title || p.name,
            category: p.category,
            price: p.price,
            originalPrice: p.originalPrice || 0,
            weight: p.weight || '1 kg',
            image: p.image || '',
            badge: p.badge || '',
            inStock: p.inStock !== undefined ? p.inStock : true,
            stock: p.stock !== undefined ? p.stock : (p.stockCount || 50),
            stockCount: p.stockCount !== undefined ? p.stockCount : (p.stock || 50),
            description: p.description || '',
            weights: p.weights || [],
            rating: p.rating || 0,
            reviewsCount: p.reviewsCount || 0
          },
          { upsert: true, new: true }
        );
      }
    }

    // 4. Seed Reviews
    console.log('💬 Seeding Reviews...');
    if (Array.isArray(data.reviews)) {
      for (const r of data.reviews) {
        await Review.findOneAndUpdate(
          { id: r.id },
          {
            id: r.id,
            productId: r.productId,
            customerName: r.customerName,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.createdAt ? new Date(r.createdAt) : new Date()
          },
          { upsert: true, new: true }
        );
      }
    }

    // 5. Seed Orders
    console.log('🛍️ Seeding Orders...');
    if (Array.isArray(data.orders)) {
      for (const o of data.orders) {
        await Order.findOneAndUpdate(
          { id: o.id },
          {
            id: o.id,
            userId: o.userId || null,
            customer: o.customer,
            address: o.customer?.address || '',
            items: o.items || [],
            subtotal: o.subtotal || 0,
            deliveryFee: o.deliveryFee || 0,
            total: o.total,
            paymentMethod: o.paymentMethod || 'Cash on Delivery (COD)',
            paymentStatus: o.paymentStatus || 'Pay on Delivery',
            status: o.status || 'Pending',
            timeline: o.timeline || []
          },
          { upsert: true, new: true }
        );
      }
    }

    // 6. Seed Settings
    console.log('⚙️ Seeding Settings...');
    if (data.settings) {
      await Settings.deleteMany({});
      await Settings.create(data.settings);
    }

    console.log('🎉 Data migration & seed complete! All records successfully inserted into MongoDB.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seedData();
