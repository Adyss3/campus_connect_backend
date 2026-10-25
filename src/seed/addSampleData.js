const mongoose = require('mongoose');
const User = require('../models/User');
const Store = require('../models/Store');
const Product = require('../models/Product');
const Job = require('../models/Job');
const Event = require('../models/Event');
require('dotenv').config();

/**
 * Add sample data WITHOUT clearing existing users
 * Run with: node src/seed/addSampleData.js
 */

const sampleUsers = [
  {
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarahjohnson@mtu.edu.ng',
    password: 'password123',
    role: 'Student',
    university: 'Mountain Top University',
    department: 'Computer Science',
    bio: 'Tech enthusiast and coding lover'
  },
  {
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michaelchen@mtu.edu.ng',
    password: 'password123',
    role: 'Student',
    university: 'Mountain Top University',
    department: 'Business Administration',
    bio: 'Aspiring entrepreneur'
  },
  {
    firstName: 'Emma',
    lastName: 'Williams',
    email: 'emmawilliams@mtu.edu.ng',
    password: 'password123',
    role: 'Student',
    university: 'Mountain Top University',
    department: 'Engineering',
    bio: 'Building the future, one project at a time'
  },
  {
    firstName: 'David',
    lastName: 'Martinez',
    email: 'davidmartinez@campus.com',
    password: 'password123',
    role: 'Entrepreneur',
    university: 'Mountain Top University',
    bio: 'Campus marketplace seller'
  },
  {
    firstName: 'Lisa',
    lastName: 'Anderson',
    email: 'lisaanderson@mtu.edu.ng',
    password: 'password123',
    role: 'Student',
    university: 'Mountain Top University',
    department: 'Mass Communication',
    bio: 'Content creator and designer'
  },
  {
    firstName: 'James',
    lastName: 'Taylor',
    email: 'jamestaylor@mtu.edu.ng',
    password: 'password123',
    role: 'Student',
    university: 'Mountain Top University',
    department: 'Computer Science',
    bio: 'Full-stack developer in training'
  },
  {
    firstName: 'Sophia',
    lastName: 'Brown',
    email: 'sophiabrown@campus.com',
    password: 'password123',
    role: 'Entrepreneur',
    university: 'Mountain Top University',
    bio: 'Handmade crafts and accessories seller'
  },
  {
    firstName: 'Daniel',
    lastName: 'Wilson',
    email: 'danielwilson@mtu.edu.ng',
    password: 'password123',
    role: 'Student',
    university: 'Mountain Top University',
    department: 'Economics',
    bio: 'Finance geek and investment enthusiast'
  },
  {
    firstName: 'Olivia',
    lastName: 'Moore',
    email: 'oliviamoore@mtu.edu.ng',
    password: 'password123',
    role: 'Student',
    university: 'Mountain Top University',
    department: 'Biology',
    bio: 'Pre-med student passionate about healthcare'
  },
  {
    firstName: 'Ryan',
    lastName: 'Garcia',
    email: 'ryangarcia@campus.com',
    password: 'password123',
    role: 'Entrepreneur',
    university: 'Mountain Top University',
    bio: 'Campus delivery service founder'
  }
];

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

const addSampleData = async () => {
  try {
    await connectDB();

    console.log('📊 Checking existing data...');
    const existingUsersCount = await User.countDocuments();
    console.log(`   Existing users: ${existingUsersCount}`);

    // Create new users (skip if email exists)
    console.log('\n👤 Adding new users...');
    let addedUsers = 0;
    const createdUsers = [];

    for (const userData of sampleUsers) {
      const existing = await User.findOne({ email: userData.email });
      if (!existing) {
        const user = await User.create(userData);
        createdUsers.push(user);
        addedUsers++;
      }
    }
    console.log(`✅ Added ${addedUsers} new users (${sampleUsers.length - addedUsers} already existed)`);

    if (createdUsers.length === 0) {
      console.log('\n⚠️  No new users created. Using existing users for sample data.');
      const existingUsers = await User.find().limit(10);
      createdUsers.push(...existingUsers);
    }

    const entrepreneurUsers = createdUsers.filter(u => u.role === 'Entrepreneur');
    const studentUsers = createdUsers.filter(u => u.role === 'Student');

    // Create stores
    console.log('\n🏬 Creating stores...');
    const stores = [];

    if (entrepreneurUsers.length > 0) {
      const storeData = [
        {
          ownerId: entrepreneurUsers[0]._id,
          storeName: 'Campus Threads',
          description: 'Trendy campus apparel, custom t-shirts, hoodies, and accessories for students',
          category: 'Apparel',
          logo: '/images/stores/default-store.jpg',
          banner: '/images/stores/default-banner.jpg',
          contactDetails: { email: entrepreneurUsers[0].email, phone: '+2348012345678' }
        },
        {
          ownerId: entrepreneurUsers[1]?._id || entrepreneurUsers[0]._id,
          storeName: 'Tech Haven',
          description: 'Affordable tech accessories, chargers, earphones, and laptop essentials',
          category: 'Electronics',
          logo: '/images/stores/bytecode tech.jpg',
          banner: '/images/stores/default-banner.jpg',
          contactDetails: { email: entrepreneurUsers[1]?.email || entrepreneurUsers[0].email, phone: '+2348098765432' }
        },
        {
          ownerId: entrepreneurUsers[2]?._id || entrepreneurUsers[0]._id,
          storeName: 'Snack Shack',
          description: 'Late-night snacks, beverages, and instant noodles delivered to your dorm',
          category: 'Food & Snacks',
          logo: '/images/stores/Dorm delights & bites.jpg',
          banner: '/images/stores/default-banner.jpg',
          contactDetails: { email: entrepreneurUsers[2]?.email || entrepreneurUsers[0].email, phone: '+2348087654321' }
        }
      ];

      for (const store of storeData) {
        const existing = await Store.findOne({ storeName: store.storeName });
        if (!existing) {
          const newStore = await Store.create(store);
          stores.push(newStore);
          await User.findByIdAndUpdate(store.ownerId, { hasStore: true, storeId: newStore._id });
        }
      }
      console.log(`✅ Created ${stores.length} new stores`);
    }

    // Create products
    console.log('\n📦 Creating products...');
    let addedProducts = 0;

    if (stores.length > 0) {
      const productData = [
        { storeId: stores[0]._id, name: 'MTU Hoodie - Navy Blue', price: 8500, category: 'Apparel', imageUrl: '/images/products/Hoodie.jpg', description: 'Comfortable cotton blend hoodie with university logo' },
        { storeId: stores[0]._id, name: 'Campus T-Shirt - White', price: 3500, category: 'Apparel', imageUrl: '/images/products/default-product.jpg', description: 'Classic fit t-shirt with MTU branding' },
        { storeId: stores[0]._id, name: 'Varsity Jacket', price: 15000, oldPrice: 18000, category: 'Apparel', imageUrl: '/images/products/varsity jacket.jpg', description: 'Premium varsity jacket with leather sleeves' },
        { storeId: stores[1]?._id || stores[0]._id, name: 'USB-C Fast Charger', price: 4500, category: 'Electronics', imageUrl: '/images/products/usb c multiport hub.jpg', description: '20W fast charging adapter for phones and tablets' },
        { storeId: stores[1]?._id || stores[0]._id, name: 'Bluetooth Earbuds', price: 8000, oldPrice: 12000, category: 'Electronics', imageUrl: '/images/products/anc haeadphones.jpg', description: 'Wireless earbuds with 6-hour battery life' },
        { storeId: stores[1]?._id || stores[0]._id, name: 'Laptop Stand', price: 6500, category: 'Electronics', imageUrl: '/images/products/default-product.jpg', description: 'Adjustable aluminum laptop stand for better ergonomics' },
        { storeId: stores[2]?._id || stores[0]._id, name: 'Instant Noodles Pack (5)', price: 2000, category: 'Food & Snacks', imageUrl: '/images/products/default-product.jpg', description: 'Assorted flavors of instant noodles' },
        { storeId: stores[2]?._id || stores[0]._id, name: 'Energy Drink (4 pack)', price: 1800, category: 'Food & Snacks', imageUrl: '/images/products/default-product.jpg', description: 'Stay energized during late study sessions' },
        { storeId: stores[2]?._id || stores[0]._id, name: 'Chips & Snacks Combo', price: 3200, category: 'Food & Snacks', imageUrl: '/images/products/cookies.jpg', description: 'Mix of chips, cookies, and candies' }
      ];

      for (const product of productData) {
        const existing = await Product.findOne({ name: product.name, storeId: product.storeId });
        if (!existing) {
          await Product.create({ ...product, ownerId: stores.find(s => s._id.equals(product.storeId))?.ownerId });
          addedProducts++;
        }
      }
      console.log(`✅ Created ${addedProducts} new products`);
    }

    // Create jobs
    console.log('\n💼 Creating jobs...');
    let addedJobs = 0;

    const jobData = [
      {
        title: 'Frontend Developer Intern',
        company: 'StartupHub NG',
        location: 'Remote',
        type: 'Internship',
        salary: '₦50,000/month',
        description: 'Build responsive web interfaces using React and modern CSS',
        requirements: ['React basics', 'HTML/CSS', 'Git knowledge'],
        postedBy: createdUsers[0]._id
      },
      {
        title: 'Social Media Manager',
        company: 'Campus Events Co.',
        location: 'On-Campus',
        type: 'Part-Time',
        salary: '₦30,000/month',
        description: 'Manage social media accounts and create engaging content',
        requirements: ['Social media experience', 'Content creation', 'Available 15 hrs/week'],
        postedBy: createdUsers[1]._id
      },
      {
        title: 'Graphic Designer',
        company: 'MTU Creative Studio',
        location: 'Hybrid',
        type: 'Part-Time',
        salary: 'Per Project',
        description: 'Design posters, flyers, and digital content for campus organizations',
        requirements: ['Adobe Photoshop/Illustrator', 'Portfolio required'],
        postedBy: createdUsers[2]._id
      },
      {
        title: 'Teaching Assistant',
        company: 'MTU Computer Science Dept',
        location: 'Main Campus',
        type: 'Part-Time',
        salary: '₦40,000/month',
        description: 'Assist professors with lab sessions and grade assignments',
        requirements: ['CS major', 'Strong GPA', 'Good communication'],
        postedBy: createdUsers[3]._id
      },
      {
        title: 'Data Entry Clerk',
        company: 'Local Business',
        location: 'City Center',
        type: 'Part-Time',
        salary: '₦25,000/month',
        description: 'Input and manage data in company database systems',
        requirements: ['Microsoft Excel', 'Attention to detail', 'Typing speed'],
        postedBy: createdUsers[4]._id
      }
    ];

    for (const job of jobData) {
      const existing = await Job.findOne({ title: job.title, company: job.company });
      if (!existing) {
        await Job.create(job);
        addedJobs++;
      }
    }
    console.log(`✅ Created ${addedJobs} new jobs`);

    // Create events
    console.log('\n📅 Creating events...');
    let addedEvents = 0;

    const eventData = [
      {
        title: 'Tech Meetup: AI & Machine Learning',
        date: new Date('2026-05-10'),
        time: '3:00 PM - 6:00 PM',
        location: 'Computer Lab 2',
        image: '/images/events/default-event.jpg',
        description: 'Learn about AI trends and network with industry professionals',
        organizedBy: studentUsers[0]?._id || createdUsers[0]._id,
        rsvps: []
      },
      {
        title: 'Campus Entrepreneurship Summit',
        date: new Date('2026-05-20'),
        time: '9:00 AM - 5:00 PM',
        location: 'Main Auditorium',
        image: '/images/events/spring career fair.jpg',
        description: 'Connect with investors, mentors, and fellow entrepreneurs',
        organizedBy: entrepreneurUsers[0]?._id || createdUsers[0]._id,
        rsvps: []
      },
      {
        title: 'Music Festival 2026',
        date: new Date('2026-06-01'),
        time: '6:00 PM onwards',
        location: 'Campus Grounds',
        image: '/images/events/default-event.jpg',
        description: 'Live performances, food trucks, and campus fun!',
        organizedBy: studentUsers[1]?._id || createdUsers[1]._id,
        rsvps: []
      },
      {
        title: 'Career Development Workshop',
        date: new Date('2026-05-15'),
        time: '2:00 PM - 4:00 PM',
        location: 'Lecture Hall 1',
        image: '/images/events/Lecture.jpg',
        description: 'Resume building, interview tips, and career guidance',
        organizedBy: studentUsers[2]?._id || createdUsers[2]._id,
        rsvps: []
      },
      {
        title: 'Gaming Tournament',
        date: new Date('2026-05-25'),
        time: '12:00 PM - 8:00 PM',
        location: 'Student Center',
        image: '/images/events/Hackathon.png',
        description: 'FIFA, Call of Duty, and more! Prizes up to ₦100k',
        organizedBy: studentUsers[3]?._id || createdUsers[3]._id,
        rsvps: []
      }
    ];

    for (const event of eventData) {
      const existing = await Event.findOne({ title: event.title });
      if (!existing) {
        await Event.create(event);
        addedEvents++;
      }
    }
    console.log(`✅ Created ${addedEvents} new events`);

    // Summary
    console.log('\n✅ Sample data added successfully!');
    console.log('\n📊 Summary:');
    console.log(`   New Users: ${addedUsers}`);
    console.log(`   New Stores: ${stores.length}`);
    console.log(`   New Products: ${addedProducts}`);
    console.log(`   New Jobs: ${addedJobs}`);
    console.log(`   New Events: ${addedEvents}`);

    const totalUsers = await User.countDocuments();
    const totalStores = await Store.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalJobs = await Job.countDocuments();
    const totalEvents = await Event.countDocuments();

    console.log('\n📈 Total Database:');
    console.log(`   Users: ${totalUsers}`);
    console.log(`   Stores: ${totalStores}`);
    console.log(`   Products: ${totalProducts}`);
    console.log(`   Jobs: ${totalJobs}`);
    console.log(`   Events: ${totalEvents}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

addSampleData();
