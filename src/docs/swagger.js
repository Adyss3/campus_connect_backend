const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Campus Connect API',
      version: '1.0.0',
      description: `
## Campus Connect — Backend API

A university platform that supports:
- **Authentication** — register, login, JWT sessions
- **Profiles** — student profiles and verification
- **Social Feed** — posts, likes, comments
- **Marketplace** — products, cart, orders
- **Jobs** — listings and applications
- **Messaging** — one-on-one real-time chat
- **Events** — creation, discovery, registration
- **Notifications** — in-app and push

> This documentation is auto-generated from JSDoc annotations in route files.
> Use the **Authorize** button to test protected endpoints.
      `,
      contact: {
        name: 'Adeeko Daniel',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: 'Local development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token (without "Bearer " prefix)',
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  error: { type: 'string', example: 'Invalid token.' },
                },
              },
            },
          },
        },
        NotFoundError: {
          description: 'The requested resource was not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  error: { type: 'string', example: 'Resource not found.' },
                },
              },
            },
          },
        },
      },
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' },
          },
        },
        UserProfile: {
          type: 'object',
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
            university: { type: 'string' },
            matricNumber: { type: 'string' },
            department: { type: 'string' },
            bio: { type: 'string' },
            profileImage: { type: 'string' },
            isVerified: { type: 'boolean' },
            verificationStatus: { type: 'string' },
          },
        },
        Verification: {
          type: 'object',
          properties: {
            userId: { type: 'string' },
            fullName: { type: 'string' },
            email: { type: 'string' },
            university: { type: 'string' },
            matricNumber: { type: 'string' },
            documentUrl: { type: 'string' },
            documentType: { type: 'string' },
            status: { type: 'string' },
          },
        },
        PublicProfile: {
          type: 'object',
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: { type: 'string' },
            university: { type: 'string' },
            department: { type: 'string' },
            bio: { type: 'string' },
            profileImage: { type: 'string' },
            isVerified: { type: 'boolean' },
          },
        },
        Conversation: {
          type: 'object',
          properties: {
            participants: { type: 'array', items: { type: 'string' } },
            requestedBy: { type: 'string' },
            requestedTo: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'active', 'declined', 'blocked'] },
          },
        },
      },
    },
    // Applied globally — individual routes can override with security: []
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Health',        description: 'Server and DB health checks' },
      { name: 'Auth',          description: 'Register, login, logout, token refresh' },
      { name: 'Users',         description: 'User profiles and account management' },
      { name: 'Feed',          description: 'Social posts, likes, and comments' },
      { name: 'Marketplace',   description: 'Products, cart, and orders' },
      { name: 'Jobs',          description: 'Job listings and applications' },
      { name: 'Messages',      description: 'Direct messaging between users' },
      { name: 'Events',        description: 'Event creation, discovery, and registration' },
      { name: 'Notifications', description: 'In-app notification management' },
      { name: 'Admin',         description: 'Admin-only moderation endpoints' },
    ],
  },
  // Scan these paths for @swagger JSDoc annotations
  apis: [
    './src/routes/*.js',
    './src/routes/**/*.js',
    './src/models/*.js',
  ],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
