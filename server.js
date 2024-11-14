// server.js
const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '/')));

// Handle socket connections
io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  // Listen for setting username
  socket.on('setUsername', (username) => {
    socket.username = username;
    io.emit('userJoined', `${socket.username} has joined the chat`);
  });

  // Listen for chat messages
  socket.on('chatMessage', (msg) => {
    if (socket.username) {
      const messageData = {
        user: socket.username,
        message: msg,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      io.emit('chatMessage', messageData);
    }
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
