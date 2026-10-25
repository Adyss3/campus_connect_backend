const express = require('express');
const router = express.Router();

const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management endpoints
 */

// Create product (private)
router.post('/', protect, createProduct);

// Get all products (public)
router.get('/', getAllProducts);

// Get single product (public)
router.get('/:id', getProductById);

// Update product (owner only)
router.patch('/:id', protect, updateProduct);

// Delete product (owner only)
router.delete('/:id', protect, deleteProduct);

module.exports = router;
