import express from 'express';
import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { requireAdmin, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

function formatOrder(doc) {
  const o = doc.toObject ? doc.toObject() : { ...doc };
  o.id = o.id || o._id.toString();
  return o;
}

// CREATE ORDER (Strictly Cash on Delivery)
router.post('/', async (req, res) => {
  try {
    const {
      customerName,
      phone,
      email,
      address,
      city,
      notes,
      items,
      subtotal,
      deliveryFee,
      total,
      userId
    } = req.body;

    if (!customerName || !phone || !address || !city) {
      return res.status(400).json({ error: 'Customer name, phone, address, and city are required' });
    }

    if (!items || !items.length) {
      return res.status(400).json({ error: 'Order must have at least one item' });
    }

    const count = await Order.countDocuments({});
    const orderId = `COD-${1000 + count + 1}`;

    const newOrder = await Order.create({
      id: orderId,
      userId: userId || null,
      customer: {
        name: customerName.trim(),
        phone: phone.trim(),
        email: email ? email.trim() : '',
        address: address.trim(),
        city: city.trim(),
        notes: notes ? notes.trim() : ''
      },
      address: address.trim(),
      items: items.map(item => ({
        id: item.id || item.productId,
        productId: item.productId || item.id,
        name: item.name,
        weight: item.weight || '1 kg',
        price: Number(item.price),
        quantity: Number(item.quantity) || 1,
        image: item.image || ''
      })),
      subtotal: Number(subtotal) || 0,
      deliveryFee: Number(deliveryFee) || 0,
      total: Number(total),
      paymentMethod: 'Cash on Delivery (COD)',
      paymentStatus: 'Pay on Delivery',
      status: 'Pending',
      timeline: [
        {
          status: 'Pending',
          timestamp: new Date(),
          description: 'Order placed successfully. Payment mode: Cash on Delivery (COD).'
        }
      ]
    });

    res.status(201).json({
      message: 'Order placed successfully via Cash on Delivery',
      order: formatOrder(newOrder)
    });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// TRACK ORDER BY ID OR PHONE (PUBLIC)
router.get('/track/:query', async (req, res) => {
  try {
    const rawQuery = req.params.query.trim();
    const cleanPhone = rawQuery.replace(/[^0-9]/g, '');

    const filters = [{ id: new RegExp(`^${rawQuery}$`, 'i') }];
    if (cleanPhone) {
      filters.push({ 'customer.phone': new RegExp(cleanPhone, 'i') });
    }

    const matched = await Order.find({ $or: filters }).sort({ createdAt: -1 });

    if (!matched.length) {
      return res.status(404).json({ error: 'No order found with the provided Order ID or Phone number' });
    }

    res.json(matched.map(formatOrder));
  } catch (err) {
    console.error('Track order error:', err);
    res.status(500).json({ error: 'Error tracking order' });
  }
});

// GET MY ORDERS (CUSTOMER AUTH)
router.get('/my-orders', authenticateToken, async (req, res) => {
  try {
    const query = {
      $or: [{ userId: req.user.id }]
    };
    if (req.user.email) {
      query.$or.push({ 'customer.email': req.user.email.toLowerCase() });
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders.map(formatOrder));
  } catch (err) {
    console.error('Fetch customer orders error:', err);
    res.status(500).json({ error: 'Failed to fetch customer orders' });
  }
});

// GET ALL ORDERS (ADMIN ONLY)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json(orders.map(formatOrder));
  } catch (err) {
    console.error('Fetch all orders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// UPDATE ORDER STATUS (ADMIN ONLY)
router.patch('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status, note } = req.body;
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    const query = isObjectId
      ? { $or: [{ id: req.params.id }, { _id: req.params.id }] }
      : { id: req.params.id };

    const order = await Order.findOne(query);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = status;
    order.timeline = order.timeline || [];
    order.timeline.push({
      status,
      timestamp: new Date(),
      description: note || `Order status updated to ${status} by Admin.`
    });

    await order.save();
    res.json({ message: 'Order status updated', order: formatOrder(order) });
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

export default router;
