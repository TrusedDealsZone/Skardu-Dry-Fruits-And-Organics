import express from 'express';
import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { Review } from '../models/Review.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Helper to compute rating from reviews
async function calculateProductRating(productId) {
  const reviews = await Review.find({ productId });
  if (!reviews || reviews.length === 0) {
    return { rating: 0, reviewsCount: 0 };
  }
  const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
  const avg = Number((sum / reviews.length).toFixed(1));
  return {
    rating: avg,
    reviewsCount: reviews.length
  };
}

// Helper to transform product doc into clean response object
function formatProduct(doc, stats) {
  const p = doc.toObject ? doc.toObject() : { ...doc };
  p.id = p.id || p._id.toString();
  p.title = p.title || p.name;
  p.name = p.name || p.title;
  p.stock = p.stock !== undefined ? p.stock : (p.stockCount !== undefined ? p.stockCount : 50);
  p.stockCount = p.stockCount !== undefined ? p.stockCount : p.stock;
  if (stats) {
    p.rating = stats.rating;
    p.reviewsCount = stats.reviewsCount;
  }
  return p;
}

// GET ALL PRODUCTS
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};

    if (category && category !== 'All') {
      const clean = category.trim().replace(/s$/i, '');
      filter.category = new RegExp(`^${category}$|^${clean}$|^${clean}s$|gem`, 'i');
    }

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { origin: { $regex: q, $options: 'i' } },
        { cut: { $regex: q, $options: 'i' } },
        { color: { $regex: q, $options: 'i' } },
        { clarity: { $regex: q, $options: 'i' } }
      ];
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });

    // Fetch all reviews to compute live ratings
    const allReviews = await Review.find({});
    const reviewStatsMap = {};
    for (const r of allReviews) {
      if (!reviewStatsMap[r.productId]) {
        reviewStatsMap[r.productId] = { sum: 0, count: 0 };
      }
      reviewStatsMap[r.productId].sum += (Number(r.rating) || 0);
      reviewStatsMap[r.productId].count += 1;
    }

    const enriched = products.map(prod => {
      const stat = reviewStatsMap[prod.id] || reviewStatsMap[prod._id.toString()];
      const rating = stat && stat.count > 0 ? Number((stat.sum / stat.count).toFixed(1)) : 0;
      const reviewsCount = stat ? stat.count : 0;
      return formatProduct(prod, { rating, reviewsCount });
    });

    res.json(enriched);
  } catch (err) {
    console.error('Fetch products error:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET SINGLE PRODUCT
router.get('/:id', async (req, res) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    const query = isObjectId
      ? { $or: [{ id: req.params.id }, { _id: req.params.id }] }
      : { id: req.params.id };

    const product = await Product.findOne(query);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const stats = await calculateProductRating(product.id || product._id.toString());
    res.json(formatProduct(product, stats));
  } catch (err) {
    console.error('Fetch single product error:', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// ADD NEW PRODUCT (ADMIN ONLY) - Full Gemstone Option C Support
router.post('/', requireAdmin, async (req, res) => {
  try {
    const {
      name,
      title,
      category,
      price,
      originalPrice,
      weight,
      image,
      images,
      badge,
      inStock,
      stock,
      stockCount,
      description,
      weights,
      // Gemstone Option C fields
      origin,
      sellingType,
      carat,
      pricePerCarat,
      clarity,
      cut,
      color,
      treatment,
      certification,
      isCertified
    } = req.body;

    const prodName = name || title;
    if (!prodName || !category) {
      return res.status(400).json({ error: 'Product name and category are required' });
    }

    // Gemstone pricing logic
    let calculatedPrice = Number(price) || 0;
    if (sellingType === 'per_carat' && carat && pricePerCarat) {
      calculatedPrice = Math.round(Number(carat) * Number(pricePerCarat));
    }

    const count = stock !== undefined ? Number(stock) : (stockCount !== undefined ? Number(stockCount) : 50);

    const newProduct = await Product.create({
      id: 'prod-' + Date.now(),
      name: prodName.trim(),
      title: prodName.trim(),
      category: category.trim(),
      price: calculatedPrice,
      originalPrice: originalPrice ? Number(originalPrice) : null,
      weight: weight !== undefined ? weight : '1 kg',
      rating: 0,
      reviewsCount: 0,
      image: image || (images && images[0]) || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=800&auto=format&fit=crop',
      images: images || (image ? [image] : []),
      badge: badge || '',
      inStock: inStock !== undefined ? Boolean(inStock) : true,
      stock: count,
      stockCount: count,
      description: description || '',
      weights: weights && weights.length > 0 ? weights : [
        { label: '500g', price: Math.round(calculatedPrice * 0.55) },
        { label: '1 kg', price: calculatedPrice }
      ],
      // Gemstone fields preserved
      origin: origin || '',
      sellingType: sellingType || 'per_piece',
      carat: carat ? Number(carat) : 0,
      pricePerCarat: pricePerCarat ? Number(pricePerCarat) : 0,
      clarity: clarity || '',
      cut: cut || '',
      color: color || '',
      treatment: treatment || 'None / Natural',
      certification: certification || '',
      isCertified: Boolean(isCertified)
    });

    res.status(201).json(formatProduct(newProduct, { rating: 0, reviewsCount: 0 }));
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// UPDATE PRODUCT (ADMIN ONLY) - Full Gemstone Option C Support
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    const query = isObjectId
      ? { $or: [{ id: req.params.id }, { _id: req.params.id }] }
      : { id: req.params.id };

    const existing = await Product.findOne(query);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updateData = { ...req.body };
    if (updateData.name && !updateData.title) updateData.title = updateData.name;
    if (updateData.title && !updateData.name) updateData.name = updateData.title;

    // Gemstone pricing logic for per_carat (merge with existing document on partial update)
    const currentSellingType = updateData.sellingType || existing.sellingType;
    const currentCarat = updateData.carat !== undefined ? updateData.carat : existing.carat;
    const currentPricePerCarat = updateData.pricePerCarat !== undefined ? updateData.pricePerCarat : existing.pricePerCarat;

    if (currentSellingType === 'per_carat' && currentCarat && currentPricePerCarat) {
      updateData.price = Math.round(Number(currentCarat) * Number(currentPricePerCarat));
    } else if (updateData.price !== undefined) {
      updateData.price = Number(updateData.price);
    }

    if (updateData.originalPrice !== undefined) updateData.originalPrice = Number(updateData.originalPrice);
    if (updateData.inStock !== undefined) updateData.inStock = Boolean(updateData.inStock);
    if (updateData.stock !== undefined && updateData.stockCount === undefined) updateData.stockCount = Number(updateData.stock);
    if (updateData.stockCount !== undefined && updateData.stock === undefined) updateData.stock = Number(updateData.stockCount);

    const updated = await Product.findOneAndUpdate(query, updateData, { returnDocument: 'after' });
    if (!updated) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const stats = await calculateProductRating(updated.id || updated._id.toString());
    res.json(formatProduct(updated, stats));
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE PRODUCT (ADMIN ONLY)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    const query = isObjectId
      ? { $or: [{ id: req.params.id }, { _id: req.params.id }] }
      : { id: req.params.id };

    const deleted = await Product.findOneAndDelete(query);
    if (!deleted) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Clean up associated reviews
    await Review.deleteMany({ $or: [{ productId: deleted.id }, { productId: deleted._id.toString() }] });

    res.json({ message: 'Product deleted successfully', id: deleted.id || deleted._id.toString() });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// GET PRODUCT REVIEWS
router.get('/:id/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.id }).sort({ createdAt: -1 });
    const stats = await calculateProductRating(req.params.id);

    const formattedReviews = reviews.map(r => {
      const obj = r.toObject ? r.toObject() : { ...r };
      obj.id = obj.id || obj._id.toString();
      return obj;
    });

    res.json({
      reviews: formattedReviews,
      ...stats
    });
  } catch (err) {
    console.error('Fetch reviews error:', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// SUBMIT PRODUCT REVIEW
router.post('/:id/reviews', async (req, res) => {
  try {
    const { customerName, rating, comment } = req.body;
    const numRating = Number(rating);

    if (!customerName || typeof customerName !== 'string' || !customerName.trim()) {
      return res.status(400).json({ error: 'Please enter your name.' });
    }
    if (!numRating || numRating < 1 || numRating > 5 || !Number.isInteger(numRating)) {
      return res.status(400).json({ error: 'Please select a rating between 1 and 5 stars.' });
    }
    if (!comment || typeof comment !== 'string' || !comment.trim()) {
      return res.status(400).json({ error: 'Please write a review comment.' });
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    const product = await Product.findOne(
      isObjectId ? { $or: [{ id: req.params.id }, { _id: req.params.id }] } : { id: req.params.id }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const prodKey = product.id || product._id.toString();

    const newReview = await Review.create({
      id: 'rev-' + Date.now() + '-' + Math.round(Math.random() * 1000),
      productId: prodKey,
      customerName: customerName.trim(),
      rating: numRating,
      comment: comment.trim()
    });

    const stats = await calculateProductRating(prodKey);

    // Update product rating and reviews count on the product document as well
    await Product.findOneAndUpdate(
      { $or: [{ id: prodKey }, { _id: product._id }] },
      { rating: stats.rating, reviewsCount: stats.reviewsCount }
    );

    const reviewObj = newReview.toObject ? newReview.toObject() : { ...newReview };
    reviewObj.id = reviewObj.id || reviewObj._id.toString();

    res.status(201).json({
      message: 'Thank you! Your review has been submitted.',
      review: reviewObj,
      ...stats
    });
  } catch (err) {
    console.error('Error submitting review:', err);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// DELETE REVIEW (ADMIN ONLY)
router.delete('/:productId/reviews/:reviewId', requireAdmin, async (req, res) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.reviewId);
    const query = isObjectId
      ? { $or: [{ id: req.params.reviewId }, { _id: req.params.reviewId }] }
      : { id: req.params.reviewId };

    const deleted = await Review.findOneAndDelete(query);
    if (!deleted) {
      return res.status(404).json({ error: 'Review not found.' });
    }

    const stats = await calculateProductRating(req.params.productId);
    await Product.findOneAndUpdate(
      { $or: [{ id: req.params.productId }, { _id: req.params.productId }] },
      { rating: stats.rating, reviewsCount: stats.reviewsCount }
    );

    res.json({ message: 'Review deleted successfully', ...stats });
  } catch (err) {
    console.error('Error deleting review:', err);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

export default router;
