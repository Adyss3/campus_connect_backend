const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Store owner reference is required']
    },
    storeName: {
      type: String,
      required: [true, 'Store name is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Store name cannot be more than 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot be more than 500 characters']
    },
    logo: {
      type: String,
      default: 'default-store-logo.jpg'
    },
    banner: {
      type: String,
      default: 'default-store-banner.jpg'
    },
    category: {
      type: String,
      required: [true, 'Store category is required']
    },
    contactDetails: {
      email: {
        type: String,
        trim: true,
        lowercase: true
      },
      phone: {
        type: String,
        trim: true
      }
    },
    socialLinks: {
      instagram: String,
      twitter: String,
      website: String
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true
  }
);

const Store = mongoose.model('Store', storeSchema);

module.exports = Store;
