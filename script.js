document.addEventListener('DOMContentLoaded', () => {
  const messageInput = document.querySelector('.message-input input');
  const sendButton = document.querySelector('.message-input button');
  const messagesContainer = document.querySelector('.messages');

  sendButton.addEventListener('click', sendMessage);
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  function sendMessage() {
    const messageText = messageInput.value.trim();
    if (messageText === '') return;

    const messageElement = document.createElement('div');
    messageElement.classList.add('message');

    messageElement.innerHTML = `
      <img src="https://via.placeholder.com/40" alt="User Avatar" class="avatar">
      <div class="message-content">
        <span class="username">You</span>
        <span class="timestamp">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        <p>${escapeHTML(messageText)}</p>
      </div>
    `;

    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    messageInput.value = '';
  }

  // Simple function to escape HTML to prevent XSS
  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Handle adding new channels (optional)
  const addChannelButton = document.querySelector('.add-channel');
  const channelList = document.querySelector('.channel-list');

  addChannelButton.addEventListener('click', () => {
    const channelName = prompt('Enter new channel name:');
    if (channelName) {
      const newChannel = document.createElement('li');
      newChannel.classList.add('channel');
      newChannel.textContent = `# ${channelName}`;
      channelList.appendChild(newChannel);
    }
  });

  // Handle server icon activation
  const serverIcons = document.querySelectorAll('.server-icon');
  serverIcons.forEach(icon => {
    icon.addEventListener('click', () => {
      serverIcons.forEach(icon => icon.classList.remove('active'));
      icon.classList.add('active');
      // You can add functionality to switch servers here
    });
  });
});
