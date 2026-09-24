import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { JWT_SECRET, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// CUSTOMER SIGNUP
router.post('/signup', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const newUser = await User.create({
      id: 'u-' + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      phone: phone ? phone.trim() : '',
      password,
      role: 'customer'
    });

    const token = jwt.sign(
      { id: newUser.id || newUser._id.toString(), email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: newUser.id || newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Internal server error during signup' });
  }
});

// LOGIN (Works for both Customer and Admin)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    
    // Check by email or username 'admin'
    let user;
    if (cleanEmail === 'admin') {
      user = await User.findOne({ $or: [{ email: 'admin@skardu.com' }, { role: 'admin' }] });
    } else {
      user = await User.findOne({ email: cleanEmail });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const userId = user.id || user._id.toString();

    const token = jwt.sign(
      { id: userId, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// GET CURRENT USER PROFILE
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({
      $or: [{ id: req.user.id }, { _id: req.user.id }]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id || user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role
    });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

export default router;
