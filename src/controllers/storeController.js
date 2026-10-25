const Store = require('../models/Store');
const User = require('../models/User');

/**
 * @desc    Create a new store
 * @route   POST /api/stores
 * @access  Private
 */
const createStore = async (req, res, next) => {
  try {
    const {
      storeName,
      description,
      category,
      logo,
      banner,
      contactDetails,
      socialLinks
    } = req.body;

    // Check if user already has a store
    if (req.user.hasStore) {
      return res.status(400).json({
        success: false,
        error: 'You already own a store'
      });
    }

    // Check if store name already exists
    const storeExists = await Store.findOne({ storeName });
    if (storeExists) {
      return res.status(400).json({
        success: false,
        error: 'A store with this name already exists'
      });
    }

    // Create store
    const store = await Store.create({
      ownerId: req.user._id,
      storeName,
      description,
      category,
      logo,
      banner,
      contactDetails,
      socialLinks
    });

    // Update user to indicate they have a store
    await User.findByIdAndUpdate(req.user._id, {
      hasStore: true,
      storeId: store._id
    });

    res.status(201).json({
      success: true,
      message: 'Store created successfully',
      data: { store }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all stores with optional filters
 * @route   GET /api/stores
 * @access  Public
 */
const getAllStores = async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;

    let query = {};

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Search by name or description
    if (search) {
      query.$or = [
        { storeName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const stores = await Store.find(query)
      .populate('ownerId', 'firstName lastName email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Store.countDocuments(query);

    res.status(200).json({
      success: true,
      count: stores.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: { stores }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single store by ID
 * @route   GET /api/stores/:id
 * @access  Public
 */
const getStoreById = async (req, res, next) => {
  try {
    const store = await Store.findById(req.params.id)
      .populate('ownerId', 'firstName lastName email profileImage')
      .populate('followers', 'firstName lastName');

    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { store }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update store (owner only)
 * @route   PATCH /api/stores/:id
 * @access  Private
 */
const updateStore = async (req, res, next) => {
  try {
    const store = await Store.findById(req.params.id);

    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found'
      });
    }

    // Check ownership
    if (store.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this store'
      });
    }

    const updatedStore = await Store.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Store updated successfully',
      data: { store: updatedStore }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete store (owner only)
 * @route   DELETE /api/stores/:id
 * @access  Private
 */
const deleteStore = async (req, res, next) => {
  try {
    const store = await Store.findById(req.params.id);

    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found'
      });
    }

    // Check ownership
    if (store.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this store'
      });
    }

    await Store.findByIdAndDelete(req.params.id);

    // Update user to indicate they no longer have a store
    await User.findByIdAndUpdate(req.user._id, {
      hasStore: false,
      storeId: null
    });

    res.status(200).json({
      success: true,
      message: 'Store deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Follow a store
 * @route   POST /api/stores/:id/follow
 * @access  Private
 */
const followStore = async (req, res, next) => {
  try {
    const store = await Store.findById(req.params.id);

    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found'
      });
    }

    // Check if already following
    if (store.followers.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        error: 'You are already following this store'
      });
    }

    store.followers.push(req.user._id);
    await store.save();

    res.status(200).json({
      success: true,
      message: 'You are now following this store',
      data: { followers: store.followers.length }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Unfollow a store
 * @route   DELETE /api/stores/:id/follow
 * @access  Private
 */
const unfollowStore = async (req, res, next) => {
  try {
    const store = await Store.findById(req.params.id);

    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Store not found'
      });
    }

    // Check if not following
    if (!store.followers.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        error: 'You are not following this store'
      });
    }

    store.followers = store.followers.filter(
      id => id.toString() !== req.user._id.toString()
    );
    await store.save();

    res.status(200).json({
      success: true,
      message: 'You have unfollowed this store',
      data: { followers: store.followers.length }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createStore,
  getAllStores,
  getStoreById,
  updateStore,
  deleteStore,
  followStore,
  unfollowStore
};
