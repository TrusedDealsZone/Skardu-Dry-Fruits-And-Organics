import express from 'express';
import mongoose from 'mongoose';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

function formatCategory(doc) {
  const c = doc.toObject ? doc.toObject() : { ...doc };
  c.id = c.id || c._id.toString();
  return c;
}

// GET ALL CATEGORIES
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ createdAt: 1 });
    res.json(categories.map(formatCategory));
  } catch (err) {
    console.error('Fetch categories error:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// CREATE NEW CATEGORY (ADMIN ONLY)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, icon, description } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const trimmedName = name.trim();
    const existing = await Category.findOne({ name: new RegExp(`^${trimmedName}$`, 'i') });
    if (existing) {
      return res.status(400).json({ error: `Category "${trimmedName}" already exists.` });
    }

    const newCategory = await Category.create({
      id: 'cat-' + Date.now(),
      name: trimmedName,
      icon: icon && icon.trim() ? icon.trim() : '🌰',
      description: description && description.trim() ? description.trim() : ''
    });

    res.status(201).json(formatCategory(newCategory));
  } catch (err) {
    console.error('Error creating category:', err);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// EDIT CATEGORY (ADMIN ONLY)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { name, icon, description } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const trimmedName = name.trim();
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    const query = isObjectId
      ? { $or: [{ id: req.params.id }, { _id: req.params.id }] }
      : { id: req.params.id };

    const category = await Category.findOne(query);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check duplicate name on another category
    const duplicate = await Category.findOne({
      name: new RegExp(`^${trimmedName}$`, 'i'),
      _id: { $ne: category._id }
    });
    if (duplicate) {
      return res.status(400).json({ error: `Category "${trimmedName}" already exists.` });
    }

    const oldName = category.name;
    category.name = trimmedName;
    if (icon !== undefined) category.icon = icon;
    if (description !== undefined) category.description = description;

    await category.save();

    // If name changed, update all products under this category
    if (oldName.toLowerCase() !== trimmedName.toLowerCase()) {
      await Product.updateMany(
        { category: new RegExp(`^${oldName}$`, 'i') },
        { category: trimmedName }
      );
    }

    res.json(formatCategory(category));
  } catch (err) {
    console.error('Error updating category:', err);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// DELETE CATEGORY SAFELY (ADMIN ONLY)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    const query = isObjectId
      ? { $or: [{ id: req.params.id }, { _id: req.params.id }] }
      : { id: req.params.id };

    const category = await Category.findOne(query);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check if products are assigned
    const assignedCount = await Product.countDocuments({
      category: new RegExp(`^${category.name}$`, 'i')
    });

    if (assignedCount > 0) {
      return res.status(400).json({
        error: `Cannot delete category "${category.name}" because ${assignedCount} product(s) are assigned to it. Please reassign or delete these products first.`
      });
    }

    await Category.findOneAndDelete(query);
    res.json({ message: 'Category deleted successfully', id: category.id || category._id.toString() });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;
