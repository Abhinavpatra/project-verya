const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const setupWebSocketServer = require('./websocket/wsServer');

const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Set up WebSocket server
const wss = setupWebSocketServer(server);

// Middleware

app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow all HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
}));

app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});