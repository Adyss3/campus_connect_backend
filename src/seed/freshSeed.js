require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Store = require('../models/Store');
const Product = require('../models/Product');
const Job = require('../models/Job');
const Event = require('../models/Event');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const clearAndSeed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('✅ MongoDB Connected\n');

    // Clear all collections
    console.log('🗑️  Clearing database...');
    await User.deleteMany({});
    await Store.deleteMany({});
    await Product.deleteMany({});
    await Job.deleteMany({});
    await Event.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    console.log('✅ Database cleared\n');

    // Create users
    console.log('👤 Creating users...');
    const users = await User.insertMany([
      { firstName: 'Sarah', lastName: 'Johnson', email: 'sarahjohnson@mtu.edu.ng', password: 'password123', role: 'Student', university: 'Mountain Top University', department: 'Computer Science' },
      { firstName: 'Michael', lastName: 'Chen', email: 'michaelchen@mtu.edu.ng', password: 'password123', role: 'Student', university: 'Mountain Top University', department: 'Business' },
      { firstName: 'Emma', lastName: 'Williams', email: 'emmawilliams@mtu.edu.ng', password: 'password123', role: 'Student', university: 'Mountain Top University', department: 'Engineering' },
      { firstName: 'David', lastName: 'Martinez', email: 'davidmartinez@campus.com', password: 'password123', role: 'Entrepreneur', university: 'Mountain Top University' },
      { firstName: 'Lisa', lastName: 'Anderson', email: 'lisaanderson@mtu.edu.ng', password: 'password123', role: 'Student', university: 'Mountain Top University', department: 'Mass Comm' },
      { firstName: 'James', lastName: 'Taylor', email: 'jamestaylor@mtu.edu.ng', password: 'password123', role: 'Student', university: 'Mountain Top University', department: 'Computer Science' },
      { firstName: 'Sophia', lastName: 'Brown', email: 'sophiabrown@campus.com', password: 'password123', role: 'Entrepreneur', university: 'Mountain Top University' },
      { firstName: 'Daniel', lastName: 'Wilson', email: 'danielwilson@mtu.edu.ng', password: 'password123', role: 'Student', university: 'Mountain Top University', department: 'Economics' },
      { firstName: 'Olivia', lastName: 'Moore', email: 'oliviamoore@mtu.edu.ng', password: 'password123', role: 'Student', university: 'Mountain Top University', department: 'Biology' },
      { firstName: 'Ryan', lastName: 'Garcia', email: 'ryangarcia@campus.com', password: 'password123', role: 'Entrepreneur', university: 'Mountain Top University' }
    ]);
    console.log(`✅ Created ${users.length} users\n`);

    const entrepreneurs = users.filter(u => u.role === 'Entrepreneur');

    // Create stores
    console.log('🏬 Creating stores...');
    const stores = await Store.insertMany([
      {
        ownerId: entrepreneurs[0]._id,
        storeName: 'Campus Threads',
        description: 'Trendy campus apparel, hoodies, and accessories',
        category: 'Apparel',
        logo: '/images/stores/mtu Gear store.jpg',
        banner: '/images/stores/default-banner.jpg',
        contactDetails: { email: entrepreneurs[0].email, phone: '+2348012345678' }
      },
      {
        ownerId: entrepreneurs[1]._id,
        storeName: 'Tech Haven',
        description: 'Tech accessories, chargers, and electronics',
        category: 'Electronics',
        logo: '/images/stores/bytecode tech.jpg',
        banner: '/images/stores/default-banner.jpg',
        contactDetails: { email: entrepreneurs[1].email, phone: '+2348098765432' }
      },
      {
        ownerId: entrepreneurs[2]._id,
        storeName: 'Snack Shack',
        description: 'Late-night snacks and beverages',
        category: 'Food & Snacks',
        logo: '/images/stores/Dorm delights & bites.jpg',
        banner: '/images/stores/default-banner.jpg',
        contactDetails: { email: entrepreneurs[2].email, phone: '+2348087654321' }
      }
    ]);
    console.log(`✅ Created ${stores.length} stores\n`);

    // Update users with store ownership
    await User.findByIdAndUpdate(entrepreneurs[0]._id, { hasStore: true, storeId: stores[0]._id });
    await User.findByIdAndUpdate(entrepreneurs[1]._id, { hasStore: true, storeId: stores[1]._id });
    await User.findByIdAndUpdate(entrepreneurs[2]._id, { hasStore: true, storeId: stores[2]._id });

    // Create products
    console.log('📦 Creating products...');
    const products = await Product.insertMany([
      { storeId: stores[0]._id, ownerId: stores[0].ownerId, name: 'MTU Hoodie - Navy Blue', price: 8500, category: 'Apparel', imageUrl: '/images/products/Hoodie.jpg', description: 'Comfortable cotton blend hoodie with university logo' },
      { storeId: stores[0]._id, ownerId: stores[0].ownerId, name: 'Varsity Jacket', price: 15000, oldPrice: 18000, category: 'Apparel', imageUrl: '/images/products/varsity jacket.jpg', description: 'Premium varsity jacket with leather sleeves' },
      { storeId: stores[0]._id, ownerId: stores[0].ownerId, name: 'Campus T-Shirt', price: 3500, category: 'Apparel', imageUrl: '/images/products/default-product.jpg', description: 'Classic fit t-shirt with MTU branding' },
      { storeId: stores[0]._id, ownerId: stores[0].ownerId, name: 'Campus Cap', price: 2500, category: 'Apparel', imageUrl: '/images/products/default-product.jpg', description: 'Stylish cap with embroidered logo' },
      { storeId: stores[1]._id, ownerId: stores[1].ownerId, name: 'USB-C Multi-port Hub', price: 10000, category: 'Electronics', imageUrl: '/images/products/usb c multiport hub.jpg', description: '7-in-1 USB-C hub with HDMI and USB-A ports' },
      { storeId: stores[1]._id, ownerId: stores[1].ownerId, name: 'Wireless ANC Headphones', price: 36000, oldPrice: 44000, category: 'Electronics', imageUrl: '/images/products/anc haeadphones.jpg', description: 'Active noise-canceling headphones with 40-hour battery' },
      { storeId: stores[1]._id, ownerId: stores[1].ownerId, name: 'Laptop Stand', price: 6500, category: 'Electronics', imageUrl: '/images/products/default-product.jpg', description: 'Adjustable aluminum laptop stand' },
      { storeId: stores[1]._id, ownerId: stores[1].ownerId, name: 'Wireless Mouse', price: 3500, category: 'Electronics', imageUrl: '/images/products/default-product.jpg', description: 'Ergonomic wireless mouse' },
      { storeId: stores[2]._id, ownerId: stores[2].ownerId, name: 'Fresh Cookies (Dozen)', price: 3600, category: 'Food & Snacks', imageUrl: '/images/products/cookies.jpg', description: 'Baked daily - chocolate chip and oatmeal raisin' },
      { storeId: stores[2]._id, ownerId: stores[2].ownerId, name: 'Home-made Waffles (4 pack)', price: 4200, category: 'Food & Snacks', imageUrl: '/images/products/waffles.jpg', description: 'Fluffy Belgian waffles with syrup' },
      { storeId: stores[2]._id, ownerId: stores[2].ownerId, name: 'Energy Drink (4 pack)', price: 1800, category: 'Food & Snacks', imageUrl: '/images/products/default-product.jpg', description: 'Stay energized during study sessions' },
      { storeId: stores[2]._id, ownerId: stores[2].ownerId, name: 'Chips & Snacks Combo', price: 3200, category: 'Food & Snacks', imageUrl: '/images/products/default-product.jpg', description: 'Mix of chips, cookies, and candies' }
    ]);
    console.log(`✅ Created ${products.length} products\n`);

    // Create jobs
    console.log('💼 Creating jobs...');
    const jobs = await Job.insertMany([
      { title: 'Frontend Developer Intern', company: 'StartupHub NG', location: 'Remote', type: 'Internship', salary: '₦50,000/month', description: 'Build web interfaces using React', requirements: ['React', 'HTML/CSS'], postedBy: users[0]._id },
      { title: 'Social Media Manager', company: 'Campus Events Co.', location: 'On-Campus', type: 'Part-Time', salary: '₦30,000/month', description: 'Manage social media accounts', requirements: ['Social media experience'], postedBy: users[1]._id },
      { title: 'Graphic Designer', company: 'MTU Creative Studio', location: 'Hybrid', type: 'Part-Time', salary: 'Per Project', description: 'Design posters and digital content', requirements: ['Photoshop/Illustrator'], postedBy: users[2]._id },
      { title: 'Teaching Assistant', company: 'MTU CS Dept', location: 'Main Campus', type: 'Part-Time', salary: '₦40,000/month', description: 'Assist professors with lab sessions', requirements: ['CS major', 'Strong GPA'], postedBy: users[3]._id },
      { title: 'Data Entry Clerk', company: 'Local Business', location: 'City Center', type: 'Part-Time', salary: '₦25,000/month', description: 'Input and manage data', requirements: ['Microsoft Excel'], postedBy: users[4]._id }
    ]);
    console.log(`✅ Created ${jobs.length} jobs\n`);

    // Create events
    console.log('📅 Creating events...');
    const events = await Event.insertMany([
      { title: 'Spring Career Fair', date: new Date('2026-04-20'), time: '10:00 AM - 4:00 PM', location: 'Main Student Union', image: '/images/events/spring career fair.jpg', description: 'Meet representatives from over 50 leading companies', organizedBy: users[0]._id, rsvps: [] },
      { title: 'MTU Hackathon 2026', date: new Date('2026-05-15'), time: '8:00 AM onwards', location: 'Engineering Building', image: '/images/events/Hackathon.png', description: '48-hour challenge with ₦800k in prizes', organizedBy: users[1]._id, rsvps: [] },
      { title: 'AI in Healthcare Lecture', date: new Date('2026-04-25'), time: '2:00 PM', location: 'Lecture Hall 3', image: '/images/events/Lecture.jpg', description: 'Learn how AI is revolutionizing healthcare', organizedBy: users[2]._id, rsvps: [] },
      { title: 'Music Festival 2026', date: new Date('2026-06-01'), time: '6:00 PM onwards', location: 'Campus Grounds', image: '/images/events/default-event.jpg', description: 'Live performances and food trucks', organizedBy: users[3]._id, rsvps: [] },
      { title: 'Gaming Tournament', date: new Date('2026-05-25'), time: '12:00 PM - 8:00 PM', location: 'Student Center', image: '/images/events/default-event.jpg', description: 'FIFA, Call of Duty - Prizes up to ₦100k', organizedBy: users[4]._id, rsvps: [] }
    ]);
    console.log(`✅ Created ${events.length} events\n`);

    // Summary
    console.log('✅ Database seeded successfully!\n');
    console.log('📊 Final Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Stores: ${stores.length}`);
    console.log(`   Products: ${products.length}`);
    console.log(`   Jobs: ${jobs.length}`);
    console.log(`   Events: ${events.length}\n`);

    console.log('🔐 Test Credentials (all use password: password123):');
    users.forEach(u => console.log(`   ${u.email}`));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

clearAndSeed();
