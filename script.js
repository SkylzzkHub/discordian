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
  socket.emit('chatMessage', msg);
  messageInput.value = '';
}

// Receive messages
socket.on('chatMessage', (data) => {
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
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
});

// User joined
socket.on('userJoined', (msg) => {
  const systemMessage = document.createElement('div');
  systemMessage.classList.add('message-system');
  systemMessage.innerHTML = `<p>${msg}</p>`;
  messagesContainer.appendChild(systemMessage);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
});

// User left
socket.on('userLeft', (msg) => {
  const systemMessage = document.createElement('div');
  systemMessage.classList.add('message-system');
  systemMessage.innerHTML = `<p>${msg}</p>`;
  messagesContainer.appendChild(systemMessage);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
});

// Logout functionality
logoutButton.addEventListener('click', () => {
  window.location.reload();
});

// Add new channel
addChannelButton.addEventListener('click', () => {
  const channelName = prompt('Enter new channel name:');
  if (channelName) {
    const newChannel = document.createElement('li');
    newChannel.classList.add('channel');
    newChannel.textContent = `# ${channelName}`;
    channelList.appendChild(newChannel);

    // Add event listener for new channel
    newChannel.addEventListener('click', () => {
      document.querySelectorAll('.channel').forEach(ch => ch.classList.remove('active'));
      newChannel.classList.add('active');
      // Implement channel switching logic here
      // For simplicity, this example does not handle multiple channels
      // To implement, you would need to manage channels on the server and client
      // and filter messages based on the selected channel
      messagesContainer.innerHTML = ''; // Clear messages when switching channels
    });
  }
});

// Handle channel switching
document.querySelectorAll('.channel').forEach(channel => {
  channel.addEventListener('click', () => {
    document.querySelectorAll('.channel').forEach(ch => ch.classList.remove('active'));
    channel.classList.add('active');
    // Implement channel switching logic here
    // For simplicity, this example does not handle multiple channels
    // To implement, you would need to manage channels on the server and client
    // and filter messages based on the selected channel
    messagesContainer.innerHTML = ''; // Clear messages when switching channels
  });
});

// Simple function to escape HTML to prevent XSS
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
