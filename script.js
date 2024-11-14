// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the root directory
app.use(express.static(__dirname));

// In-memory storage for messages and channels
let messages = []; // Stores all messages
let channels = ['general', 'random', 'support']; // Default channels

// Handle socket connections
io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  // Send existing channels and messages to the newly connected client
  socket.emit('initialize', { channels, messages });

  // Listen for setting username
  socket.on('setUsername', (username) => {
    socket.username = username;
    io.emit('userJoined', `${socket.username} has joined the chat`);
  });

  // Listen for chat messages
  socket.on('chatMessage', (data) => {
    if (socket.username && data.channel) {
      const messageData = {
        user: socket.username,
        message: data.message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        channel: data.channel,
      };
      messages.push(messageData); // Save message
      io.emit('chatMessage', messageData); // Broadcast message
    }
  });

  // Listen for adding new channels
  socket.on('addChannel', (channelName) => {
    if (channelName && !channels.includes(channelName)) {
      channels.push(channelName);
      io.emit('channelList', channels); // Update all clients
    }
  });

  // Listen for typing indicators
  socket.on('typing', (data) => {
    socket.broadcast.emit('typing', { username: socket.username, channel: data.channel });
  });

  socket.on('stopTyping', (data) => {
    socket.broadcast.emit('stopTyping', { username: socket.username, channel: data.channel });
  });

  // Handle disconnections
  socket.on('disconnect', () => {
    if (socket.username) {
      io.emit('userLeft', `${socket.username} has left the chat`);
    }
    console.log('User disconnected:', socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
