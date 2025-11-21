const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const fileInput = document.getElementById('file-input');
const attachBtn = document.getElementById('attach-btn');
const attachmentPreview = document.getElementById('attachment-preview');
const sendBtn = document.getElementById('send-btn');
const fileCountBadge = document.getElementById('file-count');

// API endpoints
const API_ENDPOINT = '/api/chat';
const API_ENDPOINT_WITH_FILES = '/api/chat-with-files';

// Conversation history
let conversationHistory = [];
let attachedFiles = [];

// Handle attach button click
attachBtn.addEventListener('click', () => {
  fileInput.click();
});

// Handle file selection
fileInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  
  // Limit to 5 files total
  const remainingSlots = 5 - attachedFiles.length;
  const filesToAdd = files.slice(0, remainingSlots);
  
  if (files.length > remainingSlots) {
    alert(`Maksimal 5 file. Hanya ${filesToAdd.length} file pertama yang akan ditambahkan.`);
  }
  
  filesToAdd.forEach(file => {
    // Check file size (10MB limit)
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

// Update file count badge
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

// Update attachment preview
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
      
      // Different icons for different file types
      let iconClass = 'fa-file';
      if (file.type === 'application/pdf') iconClass = 'fa-file-pdf';
      else if (file.type.includes('word')) iconClass = 'fa-file-word';
      else if (file.type.includes('text')) iconClass = 'fa-file-alt';
      
      fileIcon.innerHTML = `<i class="fas ${iconClass}"></i>`;
      
      // Show filename
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

// Remove file from attachments
function removeFile(index) {
  // Revoke object URL to free memory
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

// Handle form submission
form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  const hasFiles = attachedFiles.length > 0;

  if (!userMessage && !hasFiles) return;

  // Disable input and button during processing
  input.disabled = true;
  sendBtn.disabled = true;

  // Display user message with attachments
  appendUserMessage(userMessage, attachedFiles);
  
  // Save files reference before clearing
  const filesToSend = [...attachedFiles];

  // Clear input and attachments
  input.value = '';
  attachedFiles = [];
  updateAttachmentPreview();
  updateFileCount();

  // Show typing indicator
  const typingId = showTypingIndicator();

  try {
    let response;
    let data;

    // Choose endpoint based on whether files are attached
    if (hasFiles) {
      // Use multipart/form-data for files
      const formData = new FormData();
      formData.append('message', userMessage);
      formData.append('conversation', JSON.stringify(conversationHistory));
      
      // Append all files
      filesToSend.forEach(file => {
        formData.append('files', file);
      });

      response = await fetch(API_ENDPOINT_WITH_FILES, {
        method: 'POST',
        body: formData
        // Don't set Content-Type header - browser will set it with boundary
      });
    } else {
      // Use JSON for text-only messages
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

    // Remove typing indicator
    removeTypingIndicator(typingId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    data = await response.json();

    // Check if we have a valid result
    if (data.result) {
      // Add bot response to conversation history
      conversationHistory.push({
        role: 'user',
        text: userMessage
      });
      conversationHistory.push({
        role: 'model',
        text: data.result
      });
      
      // Display bot message
      appendBotMessage(data.result);
    } else {
      // No result received
      appendBotMessage('Maaf, tidak ada respons yang diterima.');
      console.error('No result in response:', data);
    }

  } catch (error) {
    // Remove typing indicator on error
    removeTypingIndicator(typingId);
    
    // Display error message
    appendBotMessage('Gagal mendapatkan respons dari server. Silakan coba lagi.');
    console.error('Error fetching response:', error);
  } finally {
    // Re-enable input and button
    input.disabled = false;
    sendBtn.disabled = false;
    input.focus();
  }
});

// Append user message
function appendUserMessage(text, files = []) {
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

  // Add file previews to message (UI only - backend integration needed for actual file processing)
  files.forEach(file => {
    if (file.type.startsWith('image/')) {
      const img = document.createElement('img');
      img.className = 'message-image';
      img.src = URL.createObjectURL(file);
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

  // Add timestamp
  const timestamp = document.createElement('div');
  timestamp.className = 'message-time';
  timestamp.textContent = getCurrentTime();
  msg.appendChild(timestamp);

  wrapper.appendChild(msg);
  
  // Remove welcome message if exists
  const welcomeMsg = chatBox.querySelector('.welcome-message');
  if (welcomeMsg) {
    welcomeMsg.remove();
  }
  
  chatBox.appendChild(wrapper);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Append bot message
function appendBotMessage(text) {
  const wrapper = document.createElement('div');
  wrapper.className = 'message-wrapper bot';

  const msg = document.createElement('div');
  msg.className = 'message bot';
  
  // Add copy button
  const copyBtn = document.createElement('button');
  copyBtn.className = 'copy-btn';
  copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
  copyBtn.onclick = () => copyMessage(text, copyBtn);
  msg.appendChild(copyBtn);
  
  // Format the text for better readability using marked.js
  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-text';
  
  // Configure marked for better rendering
  if (typeof marked !== 'undefined') {
    marked.setOptions({
      breaks: true,
      gfm: true,
      highlight: function(code, lang) {
        if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(code, { language: lang }).value;
          } catch (err) {}
        }
        return code;
      }
    });
    
    contentDiv.innerHTML = marked.parse(text);
    
    // Add copy buttons to code blocks
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
      
      // Apply syntax highlighting
      if (typeof hljs !== 'undefined') {
        hljs.highlightElement(block);
      }
    });
  } else {
    // Fallback if marked is not loaded
    contentDiv.innerHTML = formatBotMessage(text);
  }
  
  msg.appendChild(contentDiv);

  // Add timestamp
  const timestamp = document.createElement('div');
  timestamp.className = 'message-time';
  timestamp.textContent = getCurrentTime();
  msg.appendChild(timestamp);

  wrapper.appendChild(msg);
  chatBox.appendChild(wrapper);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Format bot message for better readability
function formatBotMessage(text) {
  if (!text) return '';
  
  // Convert markdown-style formatting to HTML
  let formatted = text;
  
  // Bold text: **text** or __text__
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/__(.+?)__/g, '<strong>$1</strong>');
  
  // Italic text: *text* or _text_
  formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
  formatted = formatted.replace(/_(.+?)_/g, '<em>$1</em>');
  
  // Code blocks: ```code```
  formatted = formatted.replace(/```(.+?)```/gs, '<pre><code>$1</code></pre>');
  
  // Inline code: `code`
  formatted = formatted.replace(/`(.+?)`/g, '<code>$1</code>');
  
  // Headers: ## Header
  formatted = formatted.replace(/^### (.+)$/gm, '<h4>$1</h4>');
  formatted = formatted.replace(/^## (.+)$/gm, '<h3>$1</h3>');
  formatted = formatted.replace(/^# (.+)$/gm, '<h3>$1</h3>');
  
  // Line breaks for numbered lists
  formatted = formatted.replace(/^(\d+\.)/gm, '<br>$1');
  
  // Bullet points: * item or - item
  formatted = formatted.replace(/^\* (.+)$/gm, '<div class="bullet-item">• $1</div>');
  formatted = formatted.replace(/^- (.+)$/gm, '<div class="bullet-item">• $1</div>');
  
  // Preserve line breaks
  formatted = formatted.replace(/\n\n/g, '<br><br>');
  formatted = formatted.replace(/\n/g, '<br>');
  
  // Clean up extra breaks at the start
  formatted = formatted.replace(/^(<br>)+/, '');
  
  return formatted;
}

// Show typing indicator
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

// Remove typing indicator
function removeTypingIndicator(id) {
  const indicator = document.getElementById(id);
  if (indicator) {
    indicator.remove();
  }
}

// Format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Get current time in HH:MM format
function getCurrentTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Escape HTML to prevent XSS
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

// Allow Enter to send, Shift+Enter for new line
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    form.dispatchEvent(new Event('submit'));
  }
});

// Copy message to clipboard
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

// Copy code block to clipboard
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

// Show toast notification
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

