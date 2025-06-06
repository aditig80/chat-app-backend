const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const authRoutes = require('./routes/auth');
const suggestionRoute = require('./routes/suggestionroute');
require('dotenv').config();
dotenv.config();



const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: 'http://localhost:3000' },
});

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/suggestions', suggestionRoute);

mongoose.connect(process.env.MONGO_URI).then(() => console.log('MongoDB connected'));

const User = require('./models/User');
const Message = require('./models/Message');

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

const onlineUsers = new Map();  // Map userId -> socket.id, better for tracking

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    if (!userId) return; // Defensive: ignore invalid join calls

    socket.userId = userId;
    socket.join(userId);
    onlineUsers.set(userId, socket.id);

    // Emit updated online users list (just IDs, or can be enriched)
    io.emit('online_users', Array.from(onlineUsers.keys()));

    console.log('User joined:', userId);
  });

  socket.on('send_message', ({ to, from, message }) => {
    io.to(to).emit('receive_message', { from, message });
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit('online_users', Array.from(onlineUsers.keys()));

      console.log('User disconnected:', socket.userId);
    }
    console.log('Socket disconnected:', socket.id);
  });
});



server.listen(5001, () => console.log('Server running on port 5001'));
