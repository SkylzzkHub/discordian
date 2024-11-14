// script.js

const socket = io();

// Elements
const messagesContainer = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const usernameModal = document.getElementById('username-modal');
const usernameInput = document.getElementById('username-input');
const usernameSubmit = document.getElementById('username-submit');
const logoutButton = document.getElementById('logout');
const channelList = document.getElementById('channel-list');
const addChannelButton = document.getElementById('add-channel');
const currentChannelHeader = document.getElementById('current-channel');

let currentChannel = 'general';

// Prompt for username
usernameSubmit.addEventListener('click', () => {
  const username = usernameInput.value.trim();
  if (username) {
    socket.emit('setUsername', username);
    document.querySelector('.username').textContent = username;
    document.querySelector('.avatar').textContent = username.charAt(0).toUpperCase();
    usernameModal.style.display = 'none';
  }
});

// Send message
sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

function sendMessage() {
  const msg = messageInput.value.trim();
  if (msg === '') return;
  socket.emit('chatMessage', { message: msg, channel: currentChannel });
  messageInput.value = '';
}

// Receive initial data
socket.on('initialize', (data) => {
  // Populate channels
  channelList.innerHTML = '';
  data.channels.forEach((channel) => {
    addChannelToList(channel);
  });

  // Populate messages
  data.messages.forEach((msg) => {
    if (msg.channel === currentChannel) {
      displayMessage(msg);
    }
  });
});

// Receive messages
socket.on('chatMessage', (data) => {
  if (data.channel === currentChannel) {
    displayMessage(data);
  }
});

// User joined
socket.on('userJoined', (msg) => {
  const systemMessage = document.createElement('div');
  systemMessage.classList.add('message-system');
  systemMessage.innerHTML = `<p>${msg}</p>`;
  messagesContainer.appendChild(systemMessage);
  scrollToBottom();
});

// User left
socket.on('userLeft', (msg) => {
  const systemMessage = document.createElement('div');
  systemMessage.classList.add('message-system');
  systemMessage.innerHTML = `<p>${msg}</p>`;
  messagesContainer.appendChild(systemMessage);
  scrollToBottom();
});

// Update channels list
socket.on('channelList', (channels) => {
  channelList.innerHTML = '';
  channels.forEach((channel) => {
    addChannelToList(channel);
  });
});

// Logout functionality
logoutButton.addEventListener('click', () => {
  window.location.reload();
});

// Add new channel
addChannelButton.addEventListener('click', () => {
  const channelName = prompt('Enter new channel name:');
  if (channelName && channelName.trim() !== '') {
    socket.emit('addChannel', channelName.trim());
  }
});

// Handle channel switching
function addChannelToList(channelName) {
  const channelElement = document.createElement('li');
  channelElement.classList.add('channel');
  channelElement.textContent = `# ${channelName}`;
  if (channelName === currentChannel) {
    channelElement.classList.add('active');
  }
  channelList.appendChild(channelElement);

  channelElement.addEventListener('click', () => {
    if (currentChannel !== channelName) {
      // Remove active class from all channels
      document.querySelectorAll('.channel').forEach((ch) => ch.classList.remove('active'));
      // Add active class to selected channel
      channelElement.classList.add('active');
      // Update current channel
      currentChannel = channelName;
      currentChannelHeader.textContent = `# ${currentChannel}`;
      // Clear messages
      messagesContainer.innerHTML = '';
      // Request server to send messages for the new channel
      // Since we're using in-memory storage, client-side can't filter; hence, we need to reload messages
      // Alternatively, implement server-side channel-specific message broadcasting
      // For simplicity, we're re-initializing
      socket.emit('requestInitialize');
    }
  });
}

// Display message
function displayMessage(data) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');

  messageElement.innerHTML = `
    <div class="avatar">${data.user.charAt(0).toUpperCase()}</div>
    <div class="message-content">
      <span class="username">${data.user}</span>
      <span class="timestamp">${data.time}</span>
      <p>${escapeHTML(data.message)}</p>
    </div>
  `;

  messagesContainer.appendChild(messageElement);
  scrollToBottom();
}

// Scroll to bottom
function scrollToBottom() {
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Simple function to escape HTML to prevent XSS
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
