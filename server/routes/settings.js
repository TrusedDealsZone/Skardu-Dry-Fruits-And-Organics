import express from 'express';
import { Settings } from '../models/Settings.js';
import { Category } from '../models/Category.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

function formatCategory(doc) {
  const c = doc.toObject ? doc.toObject() : { ...doc };
  c.id = c.id || c._id.toString();
  return c;
}

// GET STORE SETTINGS
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne({});
    if (!settings) {
      settings = await Settings.create({});
    }
    const result = settings.toObject ? settings.toObject() : { ...settings };
    res.json(result);
  } catch (err) {
    console.error('Fetch settings error:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// UPDATE STORE SETTINGS (ADMIN ONLY)
router.put('/', requireAdmin, async (req, res) => {
  try {
    const updateData = { ...req.body, updatedAt: new Date() };

    let settings = await Settings.findOneAndUpdate({}, updateData, {
      upsert: true,
      returnDocument: 'after'
    });

    const result = settings.toObject ? settings.toObject() : { ...settings };
    res.json({ message: 'Store settings updated successfully', settings: result });
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ error: 'Failed to update store settings' });
  }
});

// GET CATEGORIES
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ createdAt: 1 });
    res.json(categories.map(formatCategory));
  } catch (err) {
    console.error('Fetch categories error:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// UPDATE CATEGORIES (ADMIN ONLY)
router.put('/categories', requireAdmin, async (req, res) => {
  try {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({ error: 'Categories must be an array' });
    }

    const updatedCategories = [];
    for (const cat of req.body) {
      const updated = await Category.findOneAndUpdate(
        { id: cat.id },
        { name: cat.name, icon: cat.icon || '🌰', description: cat.description || '' },
        { upsert: true, returnDocument: 'after' }
      );
      updatedCategories.push(formatCategory(updated));
    }

    res.json({ message: 'Categories updated successfully', categories: updatedCategories });
  } catch (err) {
    console.error('Update categories error:', err);
    res.status(500).json({ error: 'Failed to update categories' });
  }
});

export default router;
