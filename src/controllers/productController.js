const Product = require('../models/Product');
const Store = require('../models/Store');

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Private (Store owners only)
 */
const createProduct = async (req, res, next) => {
  try {
    const {
      storeId,
      name,
      price,
      oldPrice,
      description,
      imageUrl,
      category
    } = req.body;

    // Verify the store exists and user owns it
    const store = await Store.findById(storeId);

    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found'
      });
    }

    if (store.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to add products to this store'
      });
    }

    // Create product
    const product = await Product.create({
      storeId,
      ownerId: req.user._id,
      name,
      price,
      oldPrice,
      description,
      imageUrl,
      category
    });

    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all products with optional filters
 * @route   GET /api/products
 * @access  Public
 */
const getAllProducts = async (req, res, next) => {
  try {
    const {
      storeId,
      category,
      search,
      minPrice,
      maxPrice,
      sortBy = 'newest',
      page = 1,
      limit = 20
    } = req.query;

    let query = {};

    // Filter by store
    if (storeId) {
      query.storeId = storeId;
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Sorting
    let sort = {};
    if (sortBy === 'cheapest') {
      sort.price = 1;
    } else if (sortBy === 'highest') {
      sort.price = -1;
    } else {
      sort.createdAt = -1; // newest
    }

    const skip = (page - 1) * limit;
    const products = await Product.find(query)
      .populate('storeId', 'storeName logo category')
      .populate('ownerId', 'firstName lastName')
      .skip(skip)
      .limit(parseInt(limit))
      .sort(sort);

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: { products }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('storeId', 'storeName logo banner description contactDetails socialLinks followers')
      .populate('ownerId', 'firstName lastName email');

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update product (owner only)
 * @route   PATCH /api/products/:id
 * @access  Private
 */
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Check ownership
    if (product.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this product'
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: { product: updatedProduct }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete product (owner only)
 * @route   DELETE /api/products/:id
 * @access  Private
 */
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Check ownership
    if (product.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this product'
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
};
