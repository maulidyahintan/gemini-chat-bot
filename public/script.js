const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const fileInput = document.getElementById('file-input');
const attachBtn = document.getElementById('attach-btn');
const attachmentPreview = document.getElementById('attachment-preview');
const sendBtn = document.getElementById('send-btn');
const fileCountBadge = document.getElementById('file-count');
const newChatBtn = document.getElementById('new-chat-btn');
const chatHistory = document.getElementById('chat-history');
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar');
const clearChatBtn = document.getElementById('clear-chat-btn');
const deleteModal = document.getElementById('delete-modal');
const clearModal = document.getElementById('clear-modal');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
const cancelClearBtn = document.getElementById('cancel-clear-btn');
const confirmClearBtn = document.getElementById('confirm-clear-btn');
const themeToggle = document.getElementById('theme-toggle');

const API_ENDPOINT = '/api/chat';
const API_ENDPOINT_WITH_FILES = '/api/chat-with-files';

let currentChatId = null;
let chats = [];
let conversationHistory = [];
let attachedFiles = [];
let chatToDelete = null;

function loadTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
  }
}

function toggleTheme() {
  document.body.classList.toggle('light-mode');
  const isLight = document.body.classList.contains('light-mode');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

function initializeApp() {
  loadTheme();
  loadChatsFromStorage();
  
  if (chats.length === 0) {
    createNewChat();
  } else {
    loadChat(chats[0].id);
  }
  
  renderChatHistory();
}

function createNewChat() {
  const chatId = 'chat_' + Date.now();
  const newChat = {
    id: chatId,
    title: 'Chat Baru',
    messages: [],
    conversationHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  chats.unshift(newChat);
  saveChatsToStorage();
  loadChat(chatId);
  renderChatHistory();
  
  chatBox.innerHTML = `
    <div class="welcome-message">
      <i class="fas fa-comments"></i>
      <h2>Selamat Datang di AI-ku</h2>
      <p>Tanya apa saja! Kamu juga bisa kirim gambar dan file lho.</p>
    </div>
  `;
}

function loadChat(chatId) {
  const chat = chats.find(c => c.id === chatId);
  if (!chat) return;
  
  currentChatId = chatId;
  conversationHistory = [...chat.conversationHistory];
  
  chatBox.innerHTML = '';
  
  if (chat.messages.length === 0) {
    chatBox.innerHTML = `
      <div class="welcome-message">
        <i class="fas fa-comments"></i>
        <h2>Selamat Datang di AI-ku</h2>
        <p>Tanya apa saja! Kamu juga bisa kirim gambar dan file lho.</p>
      </div>
    `;
  } else {
    chat.messages.forEach(msg => {
      if (msg.role === 'user') {
        appendUserMessage(msg.text, msg.files || [], false);
      } else {
        appendBotMessage(msg.text, false);
      }
    });
  }
  
  renderChatHistory();
  
  if (window.innerWidth <= 768) {
    closeSidebar();
  }
}

function updateChatTitle(chatId, firstMessage) {
  const chat = chats.find(c => c.id === chatId);
  if (!chat) return;
  
  const title = firstMessage.length > 50 
    ? firstMessage.substring(0, 50) + '...' 
    : firstMessage;
  
  chat.title = title;
  chat.updatedAt = new Date().toISOString();
  saveChatsToStorage();
  renderChatHistory();
}

function saveMessageToChat(role, text, files = []) {
  const chat = chats.find(c => c.id === currentChatId);
  if (!chat) return;
  
  const message = {
    role,
    text,
    files: files.map(f => ({ name: f.name, size: f.size, type: f.type })),
    timestamp: new Date().toISOString()
  };
  
  chat.messages.push(message);
  chat.conversationHistory = [...conversationHistory];
  chat.updatedAt = new Date().toISOString();
  
  if (chat.messages.length === 1 && role === 'user' && chat.title === 'Chat Baru') {
    updateChatTitle(currentChatId, text);
  }
  
  saveChatsToStorage();
}

function deleteChat(chatId, event) {
  event.stopPropagation();
  
  chatToDelete = chatId;
  showModal(deleteModal);
}

function confirmDeleteChat() {
  if (!chatToDelete) return;
  
  chats = chats.filter(c => c.id !== chatToDelete);
  saveChatsToStorage();
  
  if (currentChatId === chatToDelete) {
    if (chats.length > 0) {
      loadChat(chats[0].id);
    } else {
      createNewChat();
    }
  }
  
  renderChatHistory();
  hideModal(deleteModal);
  showToast('Chat berhasil dihapus', 'success');
  chatToDelete = null;
}

function clearCurrentChat() {
  showModal(clearModal);
}

function confirmClearChat() {
  const chat = chats.find(c => c.id === currentChatId);
  if (!chat) return;
  
  chat.messages = [];
  chat.conversationHistory = [];
  chat.title = 'Chat Baru';
  conversationHistory = [];
  
  saveChatsToStorage();
  loadChat(currentChatId);
  hideModal(clearModal);
  showToast('Chat berhasil dibersihkan', 'success');
}

function renderChatHistory() {
  if (chats.length === 0) {
    chatHistory.innerHTML = '<p style="color: #64748b; font-size: 13px; text-align: center; padding: 20px;">Belum ada riwayat chat</p>';
    return;
  }
  
  chatHistory.innerHTML = chats.map(chat => {
    const date = new Date(chat.updatedAt);
    const timeStr = formatChatTime(date);
    const isActive = chat.id === currentChatId;
    
    return `
      <div class="history-item ${isActive ? 'active' : ''}" onclick="loadChat('${chat.id}')">
        <div class="history-item-content">
          <div class="history-item-title">${escapeHtml(chat.title)}</div>
          <div class="history-item-time">${timeStr}</div>
        </div>
        <button class="history-item-delete" onclick="deleteChat('${chat.id}', event)" title="Hapus chat">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
  }).join('');
}

function formatChatTime(date) {
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      if (minutes === 0) return 'Baru saja';
      return `${minutes} menit lalu`;
    }
    return `${hours} jam lalu`;
  } else if (days === 1) {
    return 'Kemarin';
  } else if (days < 7) {
    return `${days} hari lalu`;
  } else {
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  }
}

function saveChatsToStorage() {
  try {
    localStorage.setItem('ai_chats', JSON.stringify(chats));
  } catch (e) {
    console.error('Failed to save chats:', e);
  }
}

function loadChatsFromStorage() {
  try {
    const saved = localStorage.getItem('ai_chats');
    if (saved) {
      chats = JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load chats:', e);
    chats = [];
  }
}

function showModal(modal) {
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function hideModal(modal) {
  modal.classList.remove('show');
  document.body.style.overflow = '';
}

function toggleSidebar() {
  sidebar.classList.toggle('active');
  
  let overlay = document.querySelector('.sidebar-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.onclick = closeSidebar;
    document.body.appendChild(overlay);
  }
  overlay.classList.toggle('active');
}

function closeSidebar() {
  sidebar.classList.remove('active');
  const overlay = document.querySelector('.sidebar-overlay');
  if (overlay) {
    overlay.classList.remove('active');
  }
}

newChatBtn.addEventListener('click', createNewChat);
menuToggle.addEventListener('click', toggleSidebar);
clearChatBtn.addEventListener('click', clearCurrentChat);
themeToggle.addEventListener('click', toggleTheme);

cancelDeleteBtn.addEventListener('click', () => {
  hideModal(deleteModal);
  chatToDelete = null;
});

confirmDeleteBtn.addEventListener('click', confirmDeleteChat);

cancelClearBtn.addEventListener('click', () => {
  hideModal(clearModal);
});

confirmClearBtn.addEventListener('click', confirmClearChat);

deleteModal.querySelector('.modal-overlay').addEventListener('click', () => {
  hideModal(deleteModal);
  chatToDelete = null;
});

clearModal.querySelector('.modal-overlay').addEventListener('click', () => {
  hideModal(clearModal);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (deleteModal.classList.contains('show')) {
      hideModal(deleteModal);
      chatToDelete = null;
    }
    if (clearModal.classList.contains('show')) {
      hideModal(clearModal);
    }
  }
});

window.loadChat = loadChat;
window.deleteChat = deleteChat;

attachBtn.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  
  const remainingSlots = 5 - attachedFiles.length;
  const filesToAdd = files.slice(0, remainingSlots);
  
  if (files.length > remainingSlots) {
    alert(`Maksimal 5 file. Hanya ${filesToAdd.length} file pertama yang akan ditambahkan.`);
  }
  
  filesToAdd.forEach(file => {
    if (file.size > 10 * 1024 * 1024) {
      alert(`File "${file.name}" terlalu besar. Maksimal 10MB per file.`);
      return;
    }
    
    if (!attachedFiles.find(f => f.name === file.name)) {
      attachedFiles.push(file);
    }
  });
  
  updateAttachmentPreview();
  updateFileCount();
  fileInput.value = ''; // Reset input
});

function updateFileCount() {
  if (attachedFiles.length > 0) {
    fileCountBadge.textContent = attachedFiles.length;
    fileCountBadge.style.display = 'flex';
    attachBtn.classList.add('has-files');
  } else {
    fileCountBadge.style.display = 'none';
    attachBtn.classList.remove('has-files');
  }
}

function updateAttachmentPreview() {
  if (attachedFiles.length === 0) {
    attachmentPreview.classList.remove('active');
    attachmentPreview.innerHTML = '';
    return;
  }

  attachmentPreview.classList.add('active');
  attachmentPreview.innerHTML = '<div class="preview-container"></div>';
  const container = attachmentPreview.querySelector('.preview-container');

  attachedFiles.forEach((file, index) => {
    const previewItem = document.createElement('div');
    previewItem.className = 'preview-item';
    previewItem.title = `${file.name} (${formatFileSize(file.size)})`;

    if (file.type.startsWith('image/')) {
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      img.alt = file.name;
      previewItem.appendChild(img);
    } else {
      const fileIcon = document.createElement('div');
      fileIcon.className = 'file-icon';
      
      let iconClass = 'fa-file';
      if (file.type === 'application/pdf') iconClass = 'fa-file-pdf';
      else if (file.type.includes('word')) iconClass = 'fa-file-word';
      else if (file.type.includes('text')) iconClass = 'fa-file-alt';
      
      fileIcon.innerHTML = `<i class="fas ${iconClass}"></i>`;
      
      const fileName = document.createElement('div');
      fileName.style.fontSize = '10px';
      fileName.style.marginTop = '5px';
      fileName.style.textAlign = 'center';
      fileName.style.wordBreak = 'break-word';
      fileName.textContent = file.name.length > 12 ? file.name.substring(0, 12) + '...' : file.name;
      
      fileIcon.appendChild(fileName);
      previewItem.appendChild(fileIcon);
    }

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.innerHTML = '<i class="fas fa-times"></i>';
    removeBtn.onclick = () => removeFile(index);
    removeBtn.title = 'Hapus file';
    previewItem.appendChild(removeBtn);

    container.appendChild(previewItem);
  });
}

function removeFile(index) {
  const file = attachedFiles[index];
  if (file.type.startsWith('image/')) {
    const preview = document.querySelector(`img[alt="${file.name}"]`);
    if (preview) {
      URL.revokeObjectURL(preview.src);
    }
  }
  
  attachedFiles.splice(index, 1);
  updateAttachmentPreview();
  updateFileCount();
}

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  const hasFiles = attachedFiles.length > 0;

  if (!userMessage && !hasFiles) return;

  input.disabled = true;
  sendBtn.disabled = true;

  appendUserMessage(userMessage, attachedFiles);
  
  const filesToSend = [...attachedFiles];

  input.value = '';
  attachedFiles = [];
  updateAttachmentPreview();
  updateFileCount();

  const typingId = showTypingIndicator();

  try {
    let response;
    let data;

    if (hasFiles) {
      const formData = new FormData();
      formData.append('message', userMessage);
      formData.append('conversation', JSON.stringify(conversationHistory));
      
      filesToSend.forEach(file => {
        formData.append('files', file);
      });

      response = await fetch(API_ENDPOINT_WITH_FILES, {
        method: 'POST',
        body: formData
      });
    } else {
      conversationHistory.push({
        role: 'user',
        text: userMessage
      });

      response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation: conversationHistory
        })
      });
    }

    removeTypingIndicator(typingId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    data = await response.json();

    if (data.result) {
      conversationHistory.push({
        role: 'model',
        text: data.result
      });
      
      appendBotMessage(data.result);
    } else {
      appendBotMessage('Maaf, tidak ada respons yang diterima.');
      console.error('No result in response:', data);
    }

  } catch (error) {
    removeTypingIndicator(typingId);
    
    appendBotMessage('Gagal mendapatkan respons dari server. Silakan coba lagi.');
    console.error('Error fetching response:', error);
  } finally {
    input.disabled = false;
    sendBtn.disabled = false;
    input.focus();
  }
});

function appendUserMessage(text, files = [], saveToChat = true) {
  const wrapper = document.createElement('div');
  wrapper.className = 'message-wrapper user';

  const msg = document.createElement('div');
  msg.className = 'message user';

  if (text) {
    const textNode = document.createElement('div');
    textNode.className = 'message-text';
    textNode.textContent = text;
    msg.appendChild(textNode);
  }

  files.forEach(file => {
    if (file.type?.startsWith('image/')) {
      const img = document.createElement('img');
      img.className = 'message-image';
      if (file instanceof File) {
        img.src = URL.createObjectURL(file);
      }
      msg.appendChild(img);
    } else {
      const fileDiv = document.createElement('div');
      fileDiv.className = 'message-file';
      fileDiv.innerHTML = `
        <i class="fas fa-file"></i>
        <div class="file-info">
          <div class="file-name">${escapeHtml(file.name)}</div>
          <div class="file-size">${formatFileSize(file.size)}</div>
        </div>
      `;
      msg.appendChild(fileDiv);
    }
  });

  const timestamp = document.createElement('div');
  timestamp.className = 'message-time';
  timestamp.textContent = getCurrentTime();
  msg.appendChild(timestamp);

  wrapper.appendChild(msg);
  
  const welcomeMsg = chatBox.querySelector('.welcome-message');
  if (welcomeMsg) {
    welcomeMsg.remove();
  }
  
  chatBox.appendChild(wrapper);
  chatBox.scrollTop = chatBox.scrollHeight;
  
  if (saveToChat) {
    saveMessageToChat('user', text, files);
  }
}

function appendBotMessage(text, saveToChat = true) {
  const wrapper = document.createElement('div');
  wrapper.className = 'message-wrapper bot';

  const msg = document.createElement('div');
  msg.className = 'message bot';
  
  const copyBtn = document.createElement('button');
  copyBtn.className = 'copy-btn';
  copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
  copyBtn.onclick = () => copyMessage(text, copyBtn);
  msg.appendChild(copyBtn);
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-text';
  
  if (typeof marked !== 'undefined') {
    marked.setOptions({
      breaks: true,
      gfm: true,
      highlight: function(code, lang) {
        if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(code, { language: lang }).value;
          } catch (err) {
            console.error('Highlight error:', err);
          }
        }
        return code;
      }
    });
    
    contentDiv.innerHTML = marked.parse(text);
    
    contentDiv.querySelectorAll('pre code').forEach((block, index) => {
      const pre = block.parentElement;
      const wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);
      
      const copyCodeBtn = document.createElement('button');
      copyCodeBtn.className = 'code-copy-btn';
      copyCodeBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
      copyCodeBtn.onclick = () => copyCode(block.textContent, copyCodeBtn);
      wrapper.appendChild(copyCodeBtn);
      
      if (typeof hljs !== 'undefined') {
        hljs.highlightElement(block);
      }
    });
  } else {
    contentDiv.innerHTML = formatBotMessage(text);
  }
  
  msg.appendChild(contentDiv);

  const timestamp = document.createElement('div');
  timestamp.className = 'message-time';
  timestamp.textContent = getCurrentTime();
  msg.appendChild(timestamp);

  wrapper.appendChild(msg);
  chatBox.appendChild(wrapper);
  chatBox.scrollTop = chatBox.scrollHeight;
  
  if (saveToChat) {
    saveMessageToChat('model', text);
  }
}

function formatBotMessage(text) {
  if (!text) return '';
  
  let formatted = text;
  
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/__(.+?)__/g, '<strong>$1</strong>');
  
  formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
  formatted = formatted.replace(/_(.+?)_/g, '<em>$1</em>');
  
  formatted = formatted.replace(/```(.+?)```/gs, '<pre><code>$1</code></pre>');
  
  formatted = formatted.replace(/`(.+?)`/g, '<code>$1</code>');
  
  formatted = formatted.replace(/^### (.+)$/gm, '<h4>$1</h4>');
  formatted = formatted.replace(/^## (.+)$/gm, '<h3>$1</h3>');
  formatted = formatted.replace(/^# (.+)$/gm, '<h3>$1</h3>');
  
  formatted = formatted.replace(/^(\d+\.)/gm, '<br>$1');
  
  formatted = formatted.replace(/^\* (.+)$/gm, '<div class="bullet-item">• $1</div>');
  formatted = formatted.replace(/^- (.+)$/gm, '<div class="bullet-item">• $1</div>');
  
  formatted = formatted.replace(/\n\n/g, '<br><br>');
  formatted = formatted.replace(/\n/g, '<br>');
  
  formatted = formatted.replace(/^(<br>)+/, '');
  
  return formatted;
}

function showTypingIndicator() {
  const wrapper = document.createElement('div');
  wrapper.className = 'message-wrapper bot';
  
  const indicator = document.createElement('div');
  indicator.className = 'typing-indicator';
  indicator.innerHTML = '<span></span><span></span><span></span>';
  
  const id = 'typing-' + Date.now();
  wrapper.id = id;
  wrapper.appendChild(indicator);
  
  chatBox.appendChild(wrapper);
  chatBox.scrollTop = chatBox.scrollHeight;
  
  return id;
}

function removeTypingIndicator(id) {
  const indicator = document.getElementById(id);
  if (indicator) {
    indicator.remove();
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function getCurrentTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    form.dispatchEvent(new Event('submit'));
  }
});

function copyMessage(text, button) {
  navigator.clipboard.writeText(text).then(() => {
    const originalHTML = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check"></i> Copied!';
    button.classList.add('copied');
    
    showToast('Pesan berhasil disalin!');
    
    setTimeout(() => {
      button.innerHTML = originalHTML;
      button.classList.remove('copied');
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy:', err);
    showToast('Gagal menyalin pesan', 'error');
  });
}

function copyCode(code, button) {
  navigator.clipboard.writeText(code).then(() => {
    const originalHTML = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check"></i> Copied!';
    button.classList.add('copied');
    
    showToast('Kode berhasil disalin!');
    
    setTimeout(() => {
      button.innerHTML = originalHTML;
      button.classList.remove('copied');
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy code:', err);
    showToast('Gagal menyalin kode', 'error');
  });
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');
  
  toastMessage.textContent = message;
  
  if (type === 'error') {
    toast.style.color = '#ef4444';
  } else {
    toast.style.color = '#22c55e';
  }
  
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

initializeApp();
