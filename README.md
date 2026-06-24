# Campus Connect Backend API

Backend API for Campus Connect - A university marketplace and networking platform.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

```bash
cd campus_connect_backend
npm install
```

### Environment Setup

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=5000

# MongoDB
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/campus_connect

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# CORS
CLIENT_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### Run Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:5000`

---

## 📚 API Documentation

Visit `http://localhost:5000/api-docs` for interactive Swagger documentation.

---

## 🔐 Authentication Endpoints

### Student Signup
```http
POST /api/auth/signup/student
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "johndoe@mtu.edu.ng",
  "password": "password123"
}
```

**Email Validation:**
- Must match pattern: `firstnamelastname@mtu.edu.ng`
- Case insensitive
- Automatically sets role to "Student"

### Campus Signup
```http
POST /api/auth/signup/campus
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "password": "password123",
  "role": "Entrepreneur",
  "university": "Mountain Top University"
}
```

**Allowed Roles:**
- Staff
- Entrepreneur
- Organization

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "johndoe@mtu.edu.ng",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "...",
      "firstName": "John",
      "lastName": "Doe",
      "email": "johndoe@mtu.edu.ng",
      "role": "Student",
      "hasStore": false
    },
    "token": "jwt_token_here"
  }
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

---

## 🏪 Store Endpoints

### Create Store
```http
POST /api/stores
Authorization: Bearer {token}
Content-Type: application/json

{
  "storeName": "Campus Threads",
  "description": "Premium campus apparel",
  "category": "Apparel",
  "logo": "https://...",
  "banner": "https://...",
  "contactDetails": {
    "email": "contact@campusthreads.com",
    "phone": "+2348012345678"
  },
  "socialLinks": {
    "instagram": "campus_threads",
    "twitter": "campus_threads",
    "website": "campusthreads.com"
  }
}
```

### Get All Stores
```http
GET /api/stores?category=Apparel&search=threads&page=1&limit=20
```

### Get Single Store
```http
GET /api/stores/:id
```

### Update Store (Owner Only)
```http
PATCH /api/stores/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "description": "Updated description",
  "logo": "https://new-logo.png"
}
```

### Follow Store
```http
POST /api/stores/:id/follow
Authorization: Bearer {token}
```

### Unfollow Store
```http
DELETE /api/stores/:id/follow
Authorization: Bearer {token}
```

---

## 📦 Product Endpoints

### Create Product
```http
POST /api/products
Authorization: Bearer {token}
Content-Type: application/json

{
  "storeId": "store_id",
  "name": "Classic Hoodie",
  "price": 29.99,
  "oldPrice": 39.99,
  "category": "Apparel",
  "imageUrl": "https://...",
  "description": "Comfortable cotton hoodie"
}
```

### Get All Products
```http
GET /api/products?storeId=...&category=Apparel&search=hoodie&minPrice=20&maxPrice=50&sortBy=cheapest&page=1&limit=20
```

**Sort Options:**
- `newest` (default)
- `cheapest`
- `highest`

### Get Single Product
```http
GET /api/products/:id
```

### Update Product (Owner Only)
```http
PATCH /api/products/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "price": 24.99,
  "description": "Updated description"
}
```

### Delete Product (Owner Only)
```http
DELETE /api/products/:id
Authorization: Bearer {token}
```

---

## 💼 Job Endpoints

### Create Job
```http
POST /api/jobs
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Campus Ambassador",
  "company": "TechNova",
  "location": "On-Campus",
  "type": "Part-Time",
  "salary": "$15/hr",
  "description": "Represent TechNova on campus..."
}
```

**Allowed Roles:** Staff, Admin, Organization, Entrepreneur

**Job Types:**
- Full-Time
- Part-Time
- Internship
- Work-Study

### Get All Jobs
```http
GET /api/jobs?type=Part-Time&search=campus&page=1&limit=20
```

### Get Single Job
```http
GET /api/jobs/:id
```

### Update Job (Poster Only)
```http
PATCH /api/jobs/:id
Authorization: Bearer {token}
```

### Delete Job (Poster Only)
```http
DELETE /api/jobs/:id
Authorization: Bearer {token}
```

---

## 📅 Event Endpoints

### Create Event
```http
POST /api/events
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Spring Career Fair",
  "description": "Meet representatives from 50+ companies",
  "date": "2024-04-20",
  "time": "10:00 AM - 4:00 PM",
  "location": "Main Student Union",
  "image": "https://..."
}
```

**Allowed Roles:** Staff, Admin, Organization

### Get All Events
```http
GET /api/events?search=career&page=1&limit=20
```

### Get Single Event
```http
GET /api/events/:id
```

### Update Event (Organizer Only)
```http
PATCH /api/events/:id
Authorization: Bearer {token}
```

### Delete Event (Organizer Only)
```http
DELETE /api/events/:id
Authorization: Bearer {token}
```

### RSVP to Event
```http
POST /api/events/:id/rsvp
Authorization: Bearer {token}
```

### Cancel RSVP
```http
DELETE /api/events/:id/rsvp
Authorization: Bearer {token}
```

---

## 🗄️ Database Models

### User Model
```javascript
{
  firstName: String (required),
  lastName: String (required),
  email: String (unique, required),
  password: String (hashed, required),
  role: String (Student, Entrepreneur, Staff, Organization, Admin),
  accountType: String (same as role),
  isVerifiedStudent: Boolean,
  hasStore: Boolean,
  storeId: ObjectId (ref: Store),
  university: String,
  profileImage: String,
  bio: String,
  department: String,
  isVerified: Boolean,
  verificationStatus: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Store Model
```javascript
{
  ownerId: ObjectId (ref: User, required),
  storeName: String (unique, required),
  description: String,
  logo: String,
  banner: String,
  category: String (required),
  contactDetails: {
    email: String,
    phone: String
  },
  socialLinks: {
    instagram: String,
    twitter: String,
    website: String
  },
  followers: [ObjectId] (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Product Model
```javascript
{
  storeId: ObjectId (ref: Store, required),
  ownerId: ObjectId (ref: User, required),
  name: String (required),
  price: Number (required),
  oldPrice: Number,
  description: String (required),
  imageUrl: String (required),
  category: String (required),
  createdAt: Date,
  updatedAt: Date
}
```

### Job Model
```javascript
{
  title: String (required),
  company: String (required),
  location: String (required),
  type: String (required),
  salary: String (required),
  description: String (required),
  postedBy: ObjectId (ref: User, required),
  createdAt: Date,
  updatedAt: Date
}
```

### Event Model
```javascript
{
  title: String (required),
  date: String (required),
  time: String (required),
  location: String (required),
  image: String,
  description: String (required),
  organizedBy: ObjectId (ref: User, required),
  rsvps: [ObjectId] (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔒 Middleware

### Authentication Middleware
Protects routes that require authentication.

```javascript
const { protect } = require('../middleware/authMiddleware');

router.get('/protected-route', protect, controller);
```

Checks for JWT token in Authorization header:
```
Authorization: Bearer {token}
```

### Error Handler
Centralized error handling for all routes.

### Rate Limiter
- Window: 15 minutes (configurable)
- Max requests: 100 (configurable)
- Applied to all `/api/*` routes

---

## 📁 Project Structure

```
campus_connect_backend/
├── src/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js        # Auth logic
│   │   ├── storeController.js       # Store CRUD
│   │   ├── productController.js     # Product CRUD
│   │   ├── jobController.js         # Job CRUD
│   │   ├── eventController.js       # Event CRUD
│   │   └── ...
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT verification
│   │   ├── errorHandler.js          # Error handling
│   │   └── uploadMiddleware.js      # File uploads
│   ├── models/
│   │   ├── User.js                  # User schema
│   │   ├── Store.js                 # Store schema
│   │   ├── Product.js               # Product schema
│   │   ├── Job.js                   # Job schema
│   │   ├── Event.js                 # Event schema
│   │   └── ...
│   ├── routes/
│   │   ├── index.js                 # Main router
│   │   ├── authRoutes.js            # Auth endpoints
│   │   ├── storeRoutes.js           # Store endpoints
│   │   ├── productRoutes.js         # Product endpoints
│   │   ├── jobRoutes.js             # Job endpoints
│   │   ├── eventRoutes.js           # Event endpoints
│   │   └── ...
│   ├── validations/
│   │   └── authValidation.js        # Input validation
│   ├── docs/
│   │   └── swagger.js               # API documentation
│   ├── app.js                       # Express app setup
│   └── server.js                    # Server entry point
├── uploads/                         # Uploaded files
├── .env                             # Environment variables
├── .gitignore
├── package.json
└── README.md
```

---

## 🧪 Testing

### Health Check
```http
GET /api/health
```

Response:
```json
{
  "success": true,
  "message": "Campus Connect API is running",
  "environment": "development",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 120
}
```

---

## 🚀 Deployment

### Build for Production
```bash
npm start
```

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=production_secret_key
CLIENT_ORIGIN=https://campusconnect.com
```

### Deployment Platforms
- **Heroku**: `git push heroku main`
- **Railway**: Connect GitHub repo
- **Render**: Connect GitHub repo
- **AWS EC2**: Manual deployment
- **DigitalOcean**: Docker container

---

## 📝 Development Notes

### Adding New Endpoints

1. Create controller in `src/controllers/`
2. Create route file in `src/routes/`
3. Add route to `src/routes/index.js`
4. Add Swagger documentation
5. Test with Postman or Thunder Client

### Database Seeding

Create seed file in `src/seed/` to populate initial data:

```javascript
const User = require('../models/User');
const Store = require('../models/Store');

const seedDatabase = async () => {
  // Create users
  const users = await User.create([...]);
  
  // Create stores
  const stores = await Store.create([...]);
};
```

---

## 🔧 Troubleshooting

### MongoDB Connection Error
- Check `MONGO_URI` in `.env`
- Ensure IP is whitelisted in MongoDB Atlas
- Verify database user credentials

### JWT Token Error
- Ensure `JWT_SECRET` is set in `.env`
- Check token expiration time
- Verify Authorization header format

### CORS Error
- Update `CLIENT_ORIGIN` in `.env`
- Check CORS configuration in `app.js`

---

## 📚 Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT Documentation](https://jwt.io/)
- [Swagger Documentation](https://swagger.io/)

---

## ✅ Completed Features

- ✅ User authentication (Student & Campus)
- ✅ JWT token generation
- ✅ Store CRUD operations
- ✅ Product CRUD operations
- ✅ Job listing system
- ✅ Event management
- ✅ Follow/unfollow stores
- ✅ RSVP to events
- ✅ Role-based access control
- ✅ API documentation (Swagger)
- ✅ Error handling
- ✅ Rate limiting
- ✅ File upload support

---

## 🎯 Next Steps

- [ ] Add order/cart system
- [ ] Implement payment integration (Paystack/Stripe)
- [ ] Add real-time messaging (Socket.io)
- [ ] Email verification system
- [ ] Password reset functionality
- [ ] Admin dashboard endpoints
- [ ] Product reviews/ratings
- [ ] Advanced search filters
- [ ] Analytics tracking
- [ ] Unit and integration tests

---

**Campus Connect Backend API**
*Empowering Campus Experience*

Version: 1.0.0
