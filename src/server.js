// Load environment variables FIRST — before any other imports read process.env
require('dotenv').config();

const http = require('http');
const { Server: SocketServer } = require('socket.io');

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ─────────────────────────────────────────────
// Create HTTP server (required for Socket.IO)
// ─────────────────────────────────────────────
const httpServer = http.createServer(app);

// ─────────────────────────────────────────────
// Socket.IO — attached to the same HTTP server
// Sockets logic will be added in src/sockets/ later
// ─────────────────────────────────────────────
const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  if (NODE_ENV === 'development') {
    console.log(`🔌  Socket connected: ${socket.id}`);
  }

  socket.on('disconnect', () => {
    if (NODE_ENV === 'development') {
      console.log(`🔌  Socket disconnected: ${socket.id}`);
    }
  });
});

// Make io accessible in routes via req.app.get('io')
app.set('io', io);

// ─────────────────────────────────────────────
// Start — connect DB then start listening
// ─────────────────────────────────────────────
const start = async () => {
  await connectDB();

  httpServer.listen(PORT, () => {
    console.log('');
    console.log('  ╔═══════════════════════════════════════════╗');
    console.log(`  ║   Campus Connect API                      ║`);
    console.log(`  ║   Mode  : ${NODE_ENV.padEnd(33)}║`);
    console.log(`  ║   Port  : ${String(PORT).padEnd(33)}║`);
    console.log(`  ║   API   : http://localhost:${PORT}/api       ║`);
    console.log(`  ║   Docs  : http://localhost:${PORT}/api-docs  ║`);
    console.log('  ╚═══════════════════════════════════════════╝');
    console.log('');
  });
};

start();

// ─────────────────────────────────────────────
// Graceful shutdown
// ─────────────────────────────────────────────
process.on('unhandledRejection', (err) => {
  console.error(`\n💥  Unhandled Rejection: ${err.message}`);
  httpServer.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  console.log('👋  SIGTERM received — shutting down gracefully');
  httpServer.close(() => process.exit(0));
});
