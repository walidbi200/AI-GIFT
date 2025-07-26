// src/routes/products.js

const express = require('express');
const router = express.Router();
const { getFeaturedProducts } = require('../services/productService');

// GET /api/products/featured
router.get('/api/products/featured', async (req, res) => {
  try {
    const products = await getFeaturedProducts();
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch featured products', error: error.message });
  }
});

module.exports = router; 