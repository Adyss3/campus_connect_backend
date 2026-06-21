# ⚙️ Campus Connect — Backend API Engine

<div align="center">
  <img src="../campus_connect/campusconnect/public/logo.png" alt="Campus Connect Logo" width="200" style="border-radius: 12px; margin-bottom: 20px;" />
  <p><em>Enterprise-Grade Node.js/Express MVC RESTful API & Real-Time WebSocket Engine</em></p>
  
  [![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](#)
  [![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](#)
  [![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](#)
  [![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](#)
  [![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](#)
</div>

---

## 🌟 Architectural Overview

**Campus Connect API Engine** is the enterprise-grade REST and Real-Time WebSocket backend that powers the unified campus ecosystem. Engineered with the robust **MVC (Model-View-Controller)** pattern, the system prioritizes clean separation of concerns, strict payload validation, stateless JWT authentication, deep security headers, and instant real-time synchronization.

---

## 🛡️ Key Platform Highlights

### ⚡ Technical Framework & Features
*   **MongoDB Atlas Connection (`src/config/db.js`):** Built-in fault-tolerant Mongoose connector with automated reconnection and short timeout failures to guarantee reliable Atlas cluster operations.
*   **Socket.IO WebSocket Engine (`src/sockets/`):** Real-time web socket server running on the same HTTP server port, enabling instant messaging logs, dynamic typing indicators, online/offline status syncing, and notification broadcasts.
*   **Static File Management (Multer):** Custom configured multipart file parser capable of checking, storing, and serving student/staff avatars and verification documents.
*   **Security & Protection Suite:**
    *   **Helmet:** Broad HTTP header protections against common XSS, clickjacking, and mime vulnerabilities.
    *   **CORS:** strict origin gating validating requesting clients against safe domains (e.g., `http://localhost:5173`).
    *   **Morgan:** Colorized request logs formatted for active debugging.
    *   **Express Rate Limit:** Brute-force resistance restricting users to a maximum rate of requests in a sliding window.
*   **Live Interactive Documentation (Swagger):** Fully annotated API routes using JSDoc, compiling a premium, colorized Swagger UI portal served natively at `/api-docs`. Includes raw JSON schema downloads on `/api-docs.json`.

---

## 📂 Architecture & Directory Layout

```bash
campus_connect_backend/
├── uploads/                # Dynamic user avatar & document uploads
└── src/
    ├── config/             # DB and system parameter variables (db.js)
    ├── controllers/        # Business logic handlers (auth, user, conversation, etc.)
    ├── docs/               # Swagger configuration files and schemas (swagger.js)
    ├── middleware/         # Custom middlewares (errorHandler, rate-limiting, validations)
    ├── models/             # Mongoose schemas (User, Conversation, Message, Verification)
    ├── routes/             # API Router mappings (index.js, authRoutes.js, userRoutes.js)
    ├── seed/               # Database seed scripts for initial testing
    ├── services/           # Reusable service classes (email, auth, sockets)
    ├── sockets/            # WebSocket connection handlers (socketMain.js)
    ├── utils/              # General helper utilities (errors, dynamic scripts)
    ├── validations/        # Payload validator schemas (express-validator rules)
    ├── app.js              # Central Express App configuring middleware & routers
    └── server.js           # Server start script binding HTTP ports & Socket servers
```

---

## 🛰️ Core API Endpoint Registry

Below is a summary of the routes compiled in `/api`:

### 🩺 Health System
*   `GET /api/health` — Public endpoint returning system running status, database health, environment, server uptime, and timestamp.

### 🔑 Authentication (`/api/auth`)
*   `POST /api/auth/signup` — Registers a new user with secure password hashing.
*   `POST /api/auth/login` — Checks credentials and returns a secure JWT payload.
*   `POST /api/auth/otp-verify` — Validates campus OTP codes.
*   `POST /api/auth/forgot-password` — Starts the password reset flow.

### 👤 User Services (`/api/users`)
*   `GET /api/users/profile` — Fetches current user profile metadata.
*   `PUT /api/users/profile` — Modifies student bios, roles, avatar images, and preferences.

### 🛡️ Campus Verification (`/api/verification`)
*   `POST /api/verification/upload` — Multipart document upload using Multer to request academic credentials.
*   `GET /api/verification/status` — Returns student verification statuses (Pending, Approved, Denied).

### 💬 Conversations & Messages (`/api/conversations`)
*   `GET /api/conversations` — Fetches active chat threads for the current authenticated user.
*   `POST /api/conversations` — Creates a new messaging room between two users.
*   `GET /api/conversations/:id/messages` — Retrieves messaging logs for a specific thread room.

---

## ⚡ Setup & Environment Configuration

### Prerequisites
*   [Node.js](https://nodejs.org/) (Version `>= 18.0.0`)
*   [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or a running local MongoDB instance.

### Configuration (`.env`)
Create a `.env` file in the root backend directory:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://adyss:Adebolaadeeko@campustest.menxoo1.mongodb.net/
JWT_SECRET=your_super_secret_jwt_string
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### Installation & Run Steps

1.  **Clone and navigate to the backend directory:**
    ```bash
    cd "c:/Users/Adyss_3/Documents/GITHUB/campus_connect APP/campus_connect_backend"
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the server in Development mode (with nodemon):**
    ```bash
    npm run dev
    ```

4.  **Start the server in Production mode:**
    ```bash
    npm start
    ```
    *The API will start listening at `http://localhost:5000/api`.*
    *Interactive UI documentation will be available at `http://localhost:5000/api-docs`.*
# campus_connect_backend
