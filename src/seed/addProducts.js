require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Store = require('../models/Store');
const Event = require('../models/Event');

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const productCount = await Product.countDocuments();
    const storeCount = await Store.countDocuments();
    const eventCount = await Event.countDocuments();

    console.log('📊 Database Status:');
    console.log(`   Products: ${productCount}`);
    console.log(`   Stores: ${storeCount}`);
    console.log(`   Events: ${eventCount}\n`);

    if (productCount === 0) {
      console.log('⚠️  No products found! Adding products...\n');

      const stores = await Store.find();
      if (stores.length === 0) {
        console.log('❌ No stores found. Please run seed script first.');
        process.exit(1);
      }

      const products = [
        { storeId: stores[0]._id, ownerId: stores[0].ownerId, name: 'MTU Hoodie - Navy Blue', price: 8500, category: 'Apparel', imageUrl: '/images/products/Hoodie.jpg', description: 'Comfortable cotton blend hoodie with university logo' },
        { storeId: stores[0]._id, ownerId: stores[0].ownerId, name: 'Campus T-Shirt - White', price: 3500, category: 'Apparel', imageUrl: '/images/products/default-product.jpg', description: 'Classic fit t-shirt with MTU branding' },
        { storeId: stores[0]._id, ownerId: stores[0].ownerId, name: 'Varsity Jacket', price: 15000, oldPrice: 18000, category: 'Apparel', imageUrl: '/images/products/varsity jacket.jpg', description: 'Premium varsity jacket with leather sleeves' },
        { storeId: stores[1]?._id || stores[0]._id, ownerId: stores[1]?.ownerId || stores[0].ownerId, name: 'USB-C Fast Charger', price: 4500, category: 'Electronics', imageUrl: '/images/products/usb c multiport hub.jpg', description: '20W fast charging adapter for phones and tablets' },
        { storeId: stores[1]?._id || stores[0]._id, ownerId: stores[1]?.ownerId || stores[0].ownerId, name: 'Bluetooth Earbuds', price: 8000, oldPrice: 12000, category: 'Electronics', imageUrl: '/images/products/anc haeadphones.jpg', description: 'Wireless earbuds with 6-hour battery life' },
        { storeId: stores[1]?._id || stores[0]._id, ownerId: stores[1]?.ownerId || stores[0].ownerId, name: 'Laptop Stand', price: 6500, category: 'Electronics', imageUrl: '/images/products/default-product.jpg', description: 'Adjustable aluminum laptop stand for better ergonomics' },
        { storeId: stores[2]?._id || stores[0]._id, ownerId: stores[2]?.ownerId || stores[0].ownerId, name: 'Fresh Cookies (Dozen)', price: 3600, category: 'Food & Snacks', imageUrl: '/images/products/cookies.jpg', description: 'Baked daily and delivered warm. Chocolate chip and oatmeal raisin' },
        { storeId: stores[2]?._id || stores[0]._id, ownerId: stores[2]?.ownerId || stores[0].ownerId, name: 'Home-made Waffles (Pack of 4)', price: 4200, category: 'Food & Snacks', imageUrl: '/images/products/waffles.jpg', description: 'Fluffy Belgian waffles ready to pop in your toaster' },
        { storeId: stores[2]?._id || stores[0]._id, ownerId: stores[2]?.ownerId || stores[0].ownerId, name: 'Chips & Snacks Combo', price: 3200, category: 'Food & Snacks', imageUrl: '/images/products/default-product.jpg', description: 'Mix of chips, cookies, and candies' },
        { storeId: stores[0]._id, ownerId: stores[0].ownerId, name: 'Campus Cap - Black', price: 2500, category: 'Apparel', imageUrl: '/images/products/default-product.jpg', description: 'Stylish campus cap with embroidered logo' },
        { storeId: stores[1]?._id || stores[0]._id, ownerId: stores[1]?.ownerId || stores[0].ownerId, name: 'Wireless Mouse', price: 3500, category: 'Electronics', imageUrl: '/images/products/default-product.jpg', description: 'Ergonomic wireless mouse with silent clicks' },
        { storeId: stores[2]?._id || stores[0]._id, ownerId: stores[2]?.ownerId || stores[0].ownerId, name: 'Energy Drink (4 pack)', price: 1800, category: 'Food & Snacks', imageUrl: '/images/products/default-product.jpg', description: 'Stay energized during late study sessions' }
      ];

      await Product.insertMany(products);
      console.log(`✅ Added ${products.length} products!\n`);
    } else {
      console.log('✅ Products already exist\n');
    }

    const newProductCount = await Product.countDocuments();
    console.log(`📦 Total Products: ${newProductCount}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkData();
