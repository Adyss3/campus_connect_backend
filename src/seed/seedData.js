const mongoose = require('mongoose');
const User = require('../models/User');
const Store = require('../models/Store');
const Product = require('../models/Product');
const Job = require('../models/Job');
const Event = require('../models/Event');
require('dotenv').config();

/**
 * Seed the database with test users, stores, products, jobs, and events
 * Run with: node src/seed/seedData.js
 */

const seedUsers = [
  {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'janedoe@mtu.edu.ng',
    password: 'password123',
    role: 'Student',
    accountType: 'Student',
    isVerifiedStudent: true,
    university: 'Mountain Top University'
  },
  {
    firstName: 'Sam',
    lastName: 'Sales',
    email: 'samsales@campus.com',
    password: 'password123',
    role: 'Entrepreneur',
    accountType: 'Entrepreneur',
    isVerifiedStudent: false,
    university: 'Mountain Top University'
  },
  {
    firstName: 'Alex',
    lastName: 'Active',
    email: 'alexactive@mtu.edu.ng',
    password: 'password123',
    role: 'Student',
    accountType: 'Student',
    isVerifiedStudent: true,
    university: 'Mountain Top University'
  },
  {
    firstName: 'Professor',
    lastName: 'Dele',
    email: 'profdele@mtu.edu.ng',
    password: 'password123',
    role: 'Staff',
    accountType: 'Staff',
    isVerifiedStudent: false,
    university: 'Mountain Top University'
  },
  {
    firstName: 'MTU CS',
    lastName: 'Association',
    email: 'cscassociation@mtu.edu.ng',
    password: 'password123',
    role: 'Organization',
    accountType: 'Organization',
    isVerifiedStudent: false,
    university: 'Mountain Top University'
  },
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@mtu.edu.ng',
    password: 'admin123',
    role: 'Admin',
    accountType: 'Admin',
    isVerifiedStudent: false,
    university: 'Mountain Top University'
  }
];

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campus_connect');
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Store.deleteMany({});
    await Product.deleteMany({});
    await Job.deleteMany({});
    await Event.deleteMany({});

    // Create users
    console.log('👤 Creating users...');
    const createdUsers = await User.insertMany(seedUsers);
    console.log(`✅ Created ${createdUsers.length} users`);

    const entrepreneurUser = createdUsers.find(u => u.email === 'samsales@campus.com');
    const studentEntrepreneurUser = createdUsers.find(u => u.email === 'alexactive@mtu.edu.ng');
    const staffUser = createdUsers.find(u => u.email === 'profdele@mtu.edu.ng');

    // Create stores
    console.log('🏬 Creating stores...');
    const store1 = await Store.create({
      ownerId: entrepreneurUser._id,
      storeName: 'MTU Gear Store',
      description: 'The official supplier of custom hoodies, varsity jackets, and campus accessories for students.',
      logo: 'https://placehold.co/150x150?text=Gear+Store',
      banner: 'https://placehold.co/800x250?text=MTU+Gear+Store+Banner',
      category: 'Apparel',
      contactDetails: {
        email: 'samsales@campus.com',
        phone: '+2348012345678'
      },
      socialLinks: {
        instagram: 'mtu_gear',
        twitter: 'mtu_gear',
        website: 'mtugear.shop'
      },
      followers: []
    });

    const store2 = await Store.create({
      ownerId: studentEntrepreneurUser._id,
      storeName: 'Dorm Delights & Bites',
      description: 'Providing quick snacks, home-made cookies, and fresh waffles right to your dorm room.',
      logo: 'https://placehold.co/150x150?text=Dorm+Delights',
      banner: 'https://placehold.co/800x250?text=Dorm+Delights+Banner',
      category: 'Food & Snacks',
      contactDetails: {
        email: 'alexactive@mtu.edu.ng',
        phone: '+2348098765432'
      },
      socialLinks: {
        instagram: 'dorm_bites',
        twitter: 'dorm_bites',
        website: 'dormbites.com'
      },
      followers: []
    });

    const store3 = await Store.create({
      ownerId: entrepreneurUser._id,
      storeName: 'ByteCode Tech',
      description: 'Premium tech accessories, laptop stands, chargers, and headphones for engineering students.',
      logo: 'https://placehold.co/150x150?text=ByteCode+Tech',
      banner: 'https://placehold.co/800x250?text=ByteCode+Tech+Banner',
      category: 'Electronics',
      contactDetails: {
        email: 'tech@bytecode.com',
        phone: '+2348088888888'
      },
      socialLinks: {
        instagram: 'bytecode_tech',
        twitter: 'bytecode_tech',
        website: 'bytecode.com'
      },
      followers: []
    });

    // Update users with store ownership
    await User.findByIdAndUpdate(entrepreneurUser._id, { hasStore: true, storeId: store1._id });
    await User.findByIdAndUpdate(studentEntrepreneurUser._id, { hasStore: true, storeId: store2._id });

    console.log(`✅ Created 3 stores`);

    // Create products
    console.log('📦 Creating products...');
    const products = await Product.insertMany([
      {
        storeId: store1._id,
        ownerId: entrepreneurUser._id,
        name: 'Campus Hoodie - Black',
        price: 12000,
        oldPrice: 25000,
        category: 'Apparel',
        imageUrl: 'https://placehold.co/300x220?text=Hoodie',
        description: 'Show your university pride with this ultra-comfortable, durable hoodie. Made with 100% organic cotton, featuring a classic fit and cozy fleece lining.'
      },
      {
        storeId: store1._id,
        ownerId: entrepreneurUser._id,
        name: 'Vintage Varsity Jacket',
        price: 22000,
        category: 'Apparel',
        imageUrl: 'https://placehold.co/300x220?text=Jacket',
        description: 'Retro MTU varsity jacket with high-quality embroidery and premium leather sleeves. Perfect for fall campus walks.'
      },
      {
        storeId: store2._id,
        ownerId: studentEntrepreneurUser._id,
        name: 'Fresh Dorm Cookies (Dozen)',
        price: 3600,
        oldPrice: 4800,
        category: 'Food & Snacks',
        imageUrl: 'https://placehold.co/300x220?text=Cookies',
        description: 'Baked daily and delivered warm. Assortment of chocolate chip, oatmeal raisin, and double chocolate.'
      },
      {
        storeId: store2._id,
        ownerId: studentEntrepreneurUser._id,
        name: 'Home-made Waffles (Pack of 4)',
        price: 4200,
        category: 'Food & Snacks',
        imageUrl: 'https://placehold.co/300x220?text=Waffles',
        description: 'Fluffy Belgian waffles ready to pop in your toaster. Includes maple syrup and butter packages.'
      },
      {
        storeId: store3._id,
        ownerId: entrepreneurUser._id,
        name: 'Wireless ANC Headphones',
        price: 36000,
        oldPrice: 44000,
        category: 'Electronics',
        imageUrl: 'https://placehold.co/300x220?text=Headphones',
        description: 'Active noise-canceling headphones with 40-hour battery life. Block out dorm distractions and focus on your studies.'
      },
      {
        storeId: store3._id,
        ownerId: entrepreneurUser._id,
        name: 'USB-C Multi-port Hub',
        price: 10000,
        category: 'Electronics',
        imageUrl: 'https://placehold.co/300x220?text=Hub',
        description: '7-in-1 USB-C hub with HDMI, 3 USB-A ports, SD card slots, and Power Delivery passthrough.'
      }
    ]);
    console.log(`✅ Created ${products.length} products`);

    // Create jobs
    console.log('💼 Creating jobs...');
    const jobs = await Job.insertMany([
      {
        title: 'Campus Ambassador',
        company: 'TechNova',
        location: 'On-Campus',
        type: 'Part-Time',
        salary: '₦25,000/month',
        description: 'Represent TechNova on campus. Coordinate promotional campaigns, run small tech booths in the student hub, and gather student feedback.',
        requirements: ['Good communication skills', 'Active on social media', 'Available 10 hours/week'],
        postedBy: staffUser._id
      },
      {
        title: 'Software Engineering Intern',
        company: 'Google',
        location: 'Remote',
        type: 'Internship',
        salary: 'Paid - Competitive',
        description: 'Work on production-grade systems alongside senior developers. Strong programming basics (JS, Python, or Go) required.',
        requirements: ['CS/Engineering student', 'Strong coding fundamentals', 'Portfolio/GitHub required'],
        postedBy: createdUsers.find(u => u.role === 'Admin')._id
      },
      {
        title: 'Library Assistant',
        company: 'MTU Main Library',
        location: 'Main Library',
        type: 'Work-Study',
        salary: '₦20,000/month',
        description: 'Assist students in looking up literature, sorting books, and managing computer reservations at the reception desks.',
        requirements: ['MTU student', 'Organized', 'Friendly demeanor'],
        postedBy: staffUser._id
      },
      {
        title: 'Marketing Coordinator',
        company: 'Local Agency',
        location: 'City Center',
        type: 'Full-Time',
        salary: '₦800,000/year',
        description: 'Plan and coordinate local business advertisements, design newsletters, and manage client relations.',
        requirements: ['Marketing degree/experience', 'Strong communication', 'Creative mindset'],
        postedBy: entrepreneurUser._id
      }
    ]);
    console.log(`✅ Created ${jobs.length} jobs`);

    // Create events
    console.log('📅 Creating events...');
    const events = await Event.insertMany([
      {
        title: 'Spring Career Fair',
        date: '2026-04-20',
        time: '10:00 AM - 4:00 PM',
        location: 'Main Student Union',
        image: 'https://placehold.co/600x300?text=Career+Fair',
        description: 'Meet representatives from over 50 leading companies. Bring your resume and dress to impress! Networking booths available.',
        organizedBy: staffUser._id,
        rsvps: []
      },
      {
        title: 'MTU Hackathon 2026',
        date: '2026-05-15',
        time: '8:00 AM onwards',
        location: 'Engineering Building',
        image: 'https://placehold.co/600x300?text=Hackathon',
        description: 'A 48-hour challenge to design solutions for local community issues. Free food, stickers, and up to ₦800,000 in cash prizes!',
        organizedBy: createdUsers.find(u => u.role === 'Organization')._id,
        rsvps: []
      },
      {
        title: 'AI in Healthcare Guest Lecture',
        date: '2026-04-25',
        time: '2:00 PM',
        location: 'Lecture Hall 3',
        image: 'https://placehold.co/600x300?text=Lecture',
        description: 'Dr. Dele hosts a talk on how machine learning technologies are revolutionizing modern pathology and clinical diagnostic workflows.',
        organizedBy: staffUser._id,
        rsvps: []
      }
    ]);
    console.log(`✅ Created ${events.length} events`);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${createdUsers.length}`);
    console.log(`   Stores: 3`);
    console.log(`   Products: ${products.length}`);
    console.log(`   Jobs: ${jobs.length}`);
    console.log(`   Events: ${events.length}`);
    console.log('\n🔐 Test Credentials:');
    console.log('   Student: janedoe@mtu.edu.ng / password123');
    console.log('   Entrepreneur: samsales@campus.com / password123');
    console.log('   Student+Entrepreneur: alexactive@mtu.edu.ng / password123');
    console.log('   Staff: profdele@mtu.edu.ng / password123');
    console.log('   Organization: cscassociation@mtu.edu.ng / password123');
    console.log('   Admin: admin@mtu.edu.ng / admin123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedDatabase();
