// Configuration
const API_URL = 'http://localhost:3001/api';
const SOCKET_URL = 'http://localhost:3001';

// State
let currentUser = null;
let token = null;
let socket = null;
let currentConversation = null;
let conversations = [];
let typingTimeout = null;

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const chatInterface = document.getElementById('chatInterface');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const conversationsList = document.getElementById('conversationsList');
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const noConversationSelected = document.getElementById('noConversationSelected');
const activeConversation = document.getElementById('activeConversation');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

function checkAuth() {
    const savedToken = localStorage.getItem('chat_token');
    const savedUser = localStorage.getItem('chat_user');
    
    if (savedToken && savedUser) {
        token = savedToken;
        currentUser = JSON.parse(savedUser);
        showChatInterface();
        initializeSocket();
        loadConversations();
    } else {
        showLoginScreen();
    }
}

function setupEventListeners() {
    // Authentication
    document.getElementById('loginBtn').addEventListener('click', handleLogin);
    document.getElementById('registerBtn').addEventListener('click', handleRegister);
    document.getElementById('forgotPasswordBtn').addEventListener('click', handleForgotPassword);
    
    document.getElementById('showRegister').addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('d-none');
        registerForm.classList.remove('d-none');
    });
    
    document.getElementById('showLogin').addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.classList.add('d-none');
        loginForm.classList.remove('d-none');
    });
    
    document.getElementById('showForgotPassword').addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('d-none');
        forgotPasswordForm.classList.remove('d-none');
    });
    
    document.getElementById('showLoginFromForgot').addEventListener('click', (e) => {
        e.preventDefault();
        forgotPasswordForm.classList.add('d-none');
        loginForm.classList.remove('d-none');
    });
    
    // Chat functionality
    document.getElementById('sendMessageBtn').addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    messageInput.addEventListener('input', handleTyping);
    
    document.getElementById('newChatBtn').addEventListener('click', () => {
        document.getElementById('findPartnersModal').classList.remove('d-none');
    });
    
    document.getElementById('searchPartnersBtn').addEventListener('click', searchPartners);
    document.getElementById('closeFindPartnersModal').addEventListener('click', () => {
        document.getElementById('findPartnersModal').classList.add('d-none');
    });
    
    // Profile
    document.getElementById('settingsBtn').addEventListener('click', showProfileModal);
    document.getElementById('closeProfileModal').addEventListener('click', () => {
        document.getElementById('profileModal').classList.add('d-none');
    });
    
    document.getElementById('saveProfileBtn').addEventListener('click', saveProfile);
    document.getElementById('changePhotoBtn').addEventListener('click', () => {
        document.getElementById('photoInput').click();
    });
    
    document.getElementById('photoInput').addEventListener('change', handleProfilePhotoUpload);
    
    // File upload
    document.getElementById('attachFileBtn').addEventListener('click', () => {
        document.getElementById('fileUploadModal').classList.remove('d-none');
    });
    
    document.getElementById('closeFileUploadModal').addEventListener('click', () => {
        document.getElementById('fileUploadModal').classList.add('d-none');
    });
    
    document.getElementById('selectFileBtn').addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });
    
    document.getElementById('fileInput').addEventListener('change', handleFileSelection);
    document.getElementById('uploadFilesBtn').addEventListener('click', uploadFiles);
    
    // Logout
    document.getElementById('chatLogoutBtn').addEventListener('click', handleLogout);
    
    // Search conversations
    document.getElementById('searchConversations').addEventListener('input', (e) => {
        filterConversations(e.target.value);
    });
}

// Authentication Functions
async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        Swal.fire('Error', 'Por favor completa todos los campos', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.ok) {
            token = data.token;
            currentUser = data.user;
            localStorage.setItem('chat_token', token);
            localStorage.setItem('chat_user', JSON.stringify(currentUser));
            showChatInterface();
            initializeSocket();
            loadConversations();
        } else {
            Swal.fire('Error', data.message, 'error');
        }
    } catch (error) {
        Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
    }
}

async function handleRegister() {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const native_language = document.getElementById('nativeLanguage').value;
    const learning_language = document.getElementById('learningLanguage').value;
    const language_level = document.getElementById('languageLevel').value;
    
    if (!name || !email || !password) {
        Swal.fire('Error', 'Por favor completa todos los campos requeridos', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, native_language, learning_language, language_level })
        });
        
        const data = await response.json();
        
        if (data.ok) {
            token = data.token;
            currentUser = data.user;
            localStorage.setItem('chat_token', token);
            localStorage.setItem('chat_user', JSON.stringify(currentUser));
            showChatInterface();
            initializeSocket();
            loadConversations();
        } else {
            Swal.fire('Error', data.message, 'error');
        }
    } catch (error) {
        Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
    }
}

async function handleForgotPassword() {
    const email = document.getElementById('forgotEmail').value;
    
    if (!email) {
        Swal.fire('Error', 'Por favor ingresa tu correo electrónico', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (data.ok) {
            Swal.fire('Éxito', data.message, 'success');
            forgotPasswordForm.classList.add('d-none');
            loginForm.classList.remove('d-none');
        } else {
            Swal.fire('Error', data.message, 'error');
        }
    } catch (error) {
        Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
    }
}

function handleLogout() {
    localStorage.removeItem('chat_token');
    localStorage.removeItem('chat_user');
    token = null;
    currentUser = null;
    
    if (socket) {
        socket.disconnect();
        socket = null;
    }
    
    showLoginScreen();
}

// UI Functions
function showLoginScreen() {
    loginScreen.classList.remove('d-none');
    chatInterface.classList.add('d-none');
}

function showChatInterface() {
    loginScreen.classList.add('d-none');
    chatInterface.classList.remove('d-none');
    
    document.getElementById('currentUserName').textContent = currentUser.name;
    document.getElementById('currentUserStatus').textContent = 'en línea';
    
    if (currentUser.profile_photo) {
        document.querySelector('#currentUserProfile .profile-photo').src = currentUser.profile_photo;
    }
}

// Socket.IO Functions
function initializeSocket() {
    socket = io(SOCKET_URL, {
        auth: { token }
    });
    
    socket.on('connect', () => {
        console.log('Connected to server');
        updateUserStatus('online');
    });
    
    socket.on('disconnect', () => {
        console.log('Disconnected from server');
    });
    
    socket.on('error', (error) => {
        console.error('Socket error:', error);
        Swal.fire('Error', error.message, 'error');
    });
    
    socket.on('message:new', (message) => {
        if (currentConversation && currentConversation.id === message.conversation_id) {
            appendMessage(message);
            markMessagesAsRead(message.id);
        } else {
            loadConversations();
        }
    });
    
    socket.on('message:delivered', (data) => {
        updateMessageStatus(data.messageId, 'delivered');
    });
    
    socket.on('message:read', (data) => {
        updateMessageStatus(data.messageId, 'read');
    });
    
    socket.on('message:edited', (message) => {
        updateMessageContent(message);
    });
    
    socket.on('message:deleted', (data) => {
        removeMessage(data.messageId);
    });
    
    socket.on('user:typing', (data) => {
        if (currentConversation && currentConversation.id === data.conversationId) {
            showTypingIndicator(data.userId, data.isTyping);
        }
    });
    
    socket.on('user:status', (data) => {
        updateUserStatusInList(data.userId, data.status);
        if (currentConversation && currentConversation.other_user_id === data.userId) {
            document.getElementById('activeConversationStatus').textContent = 
                data.status === 'online' ? 'en línea' : 'desconectado';
        }
    });
}

function updateUserStatus(status) {
    fetch(`${API_URL}/users/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
    });
}

// Conversation Functions
async function loadConversations() {
    try {
        const response = await fetch(`${API_URL}/conversations`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        if (data.ok) {
            conversations = data.conversations;
            renderConversations();
        }
    } catch (error) {
        console.error('Error loading conversations:', error);
    }
}

function renderConversations() {
    conversationsList.innerHTML = '';
    
    conversations.forEach(conversation => {
        const div = document.createElement('div');
        div.className = `conversation-item ${currentConversation && currentConversation.id === conversation.id ? 'active' : ''}`;
        div.innerHTML = `
            <img src="${conversation.display_photo || 'https://via.placeholder.com/50'}" alt="${conversation.display_name}" class="conversation-photo">
            <div class="conversation-info">
                <div class="conversation-header">
                    <span class="conversation-name">${conversation.display_name}</span>
                    <span class="conversation-time">${formatTime(conversation.last_message_time)}</span>
                </div>
                <div class="conversation-preview">
                    <span class="conversation-last-message">${conversation.last_message || 'Sin mensajes'}</span>
                    ${conversation.unread_count > 0 ? `<span class="unread-badge">${conversation.unread_count}</span>` : ''}
                </div>
            </div>
        `;
        
        div.addEventListener('click', () => selectConversation(conversation));
        conversationsList.appendChild(div);
    });
}

function filterConversations(query) {
    const filtered = conversations.filter(conv => 
        conv.display_name.toLowerCase().includes(query.toLowerCase()) ||
        (conv.last_message && conv.last_message.toLowerCase().includes(query.toLowerCase()))
    );
    
    conversationsList.innerHTML = '';
    
    filtered.forEach(conversation => {
        const div = document.createElement('div');
        div.className = `conversation-item ${currentConversation && currentConversation.id === conversation.id ? 'active' : ''}`;
        div.innerHTML = `
            <img src="${conversation.display_photo || 'https://via.placeholder.com/50'}" alt="${conversation.display_name}" class="conversation-photo">
            <div class="conversation-info">
                <div class="conversation-header">
                    <span class="conversation-name">${conversation.display_name}</span>
                    <span class="conversation-time">${formatTime(conversation.last_message_time)}</span>
                </div>
                <div class="conversation-preview">
                    <span class="conversation-last-message">${conversation.last_message || 'Sin mensajes'}</span>
                    ${conversation.unread_count > 0 ? `<span class="unread-badge">${conversation.unread_count}</span>` : ''}
                </div>
            </div>
        `;
        
        div.addEventListener('click', () => selectConversation(conversation));
        conversationsList.appendChild(div);
    });
}

async function selectConversation(conversation) {
    currentConversation = conversation;
    
    // Update UI
    noConversationSelected.classList.add('d-none');
    activeConversation.classList.remove('d-none');
    
    document.getElementById('activeConversationName').textContent = conversation.display_name;
    document.getElementById('activeConversationPhoto').src = conversation.display_photo || 'https://via.placeholder.com/40';
    document.getElementById('activeConversationStatus').textContent = 
        conversation.other_user_status === 'online' ? 'en línea' : 'desconectado';
    
    // Join conversation room
    if (socket) {
        socket.emit('conversation:join', conversation.id);
    }
    
    // Load messages
    await loadMessages(conversation.id);
    
    // Update active state in list
    renderConversations();
}

async function loadMessages(conversationId) {
    try {
        const response = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        if (data.ok) {
            chatMessages.innerHTML = '';
            data.messages.reverse().forEach(message => {
                appendMessage(message);
            });
            scrollToBottom();
        }
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

// Message Functions
function sendMessage() {
    const content = messageInput.value.trim();
    
    if (!content || !currentConversation || !socket) return;
    
    socket.emit('message:send', {
        conversationId: currentConversation.id,
        content,
        messageType: 'text'
    });
    
    messageInput.value = '';
    
    // Stop typing indicator
    if (typingTimeout) {
        clearTimeout(typingTimeout);
        socket.emit('typing:stop', currentConversation.id);
    }
}

function appendMessage(message) {
    const isSent = message.sender_id === currentUser.id;
    
    const div = document.createElement('div');
    div.className = `message ${isSent ? 'sent' : 'received'}`;
    div.dataset.messageId = message.id;
    
    let contentHtml = '';
    
    if (message.reply_to_content) {
        contentHtml += `
            <div class="reply-message">
                <span class="reply-author">${message.reply_to_sender_name}</span>
                <span class="reply-content">${message.reply_to_content}</span>
            </div>
        `;
    }
    
    contentHtml += `<div class="message-content">${message.content}</div>`;
    
    if (message.edited) {
        contentHtml += `<span class="edited">(editado)</span>`;
    }
    
    contentHtml += `
        <div class="message-info">
            <span class="message-time">${formatTime(message.created_at)}</span>
            ${isSent ? `<span class="message-status">${message.read_at ? '✓✓' : message.delivered_at ? '✓' : ''}</span>` : ''}
        </div>
    `;
    
    div.innerHTML = contentHtml;
    chatMessages.appendChild(div);
    scrollToBottom();
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function handleTyping() {
    if (!currentConversation || !socket) return;
    
    socket.emit('typing:start', currentConversation.id);
    
    if (typingTimeout) {
        clearTimeout(typingTimeout);
    }
    
    typingTimeout = setTimeout(() => {
        socket.emit('typing:stop', currentConversation.id);
    }, 1000);
}

function showTypingIndicator(userId, isTyping) {
    const existingIndicator = document.querySelector('.typing-indicator');
    
    if (isTyping && !existingIndicator) {
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;
        chatMessages.appendChild(indicator);
        scrollToBottom();
    } else if (!isTyping && existingIndicator) {
        existingIndicator.remove();
    }
}

function markMessagesAsRead(messageId) {
    if (socket && currentConversation) {
        socket.emit('message:read', {
            messageId,
            conversationId: currentConversation.id
        });
    }
}

function updateMessageStatus(messageId, status) {
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (messageElement) {
        const statusElement = messageElement.querySelector('.message-status');
        if (statusElement) {
            statusElement.textContent = status === 'read' ? '✓✓' : '✓';
        }
    }
}

function updateMessageContent(message) {
    const messageElement = document.querySelector(`[data-message-id="${message.id}"]`);
    if (messageElement) {
        const contentElement = messageElement.querySelector('.message-content');
        if (contentElement) {
            contentElement.textContent = message.content;
        }
        
        if (!messageElement.querySelector('.edited')) {
            const editedSpan = document.createElement('span');
            editedSpan.className = 'edited';
            editedSpan.textContent = '(editado)';
            messageElement.querySelector('.message-info').before(editedSpan);
        }
    }
}

function removeMessage(messageId) {
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (messageElement) {
        messageElement.remove();
    }
}

function updateUserStatusInList(userId, status) {
    // Update status in conversation list
    const conversation = conversations.find(conv => conv.other_user_id === userId);
    if (conversation) {
        conversation.other_user_status = status;
        renderConversations();
    }
}

// Partner Matching Functions
async function searchPartners() {
    const nativeLanguage = document.getElementById('searchNativeLanguage').value;
    const learningLanguage = document.getElementById('searchLearningLanguage').value;
    
    try {
        const response = await fetch(`${API_URL}/users/search/match?native_language=${nativeLanguage}&learning_language=${learningLanguage}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        if (data.ok) {
            renderPartners(data.users);
        }
    } catch (error) {
        console.error('Error searching partners:', error);
    }
}

function renderPartners(users) {
    const partnersList = document.getElementById('partnersList');
    partnersList.innerHTML = '';
    
    if (users.length === 0) {
        partnersList.innerHTML = '<p class="text-center text-muted">No se encontraron compañeros</p>';
        return;
    }
    
    users.forEach(user => {
        const div = document.createElement('div');
        div.className = 'partner-item';
        div.innerHTML = `
            <img src="${user.profile_photo || 'https://via.placeholder.com/50'}" alt="${user.name}" class="partner-photo">
            <div class="partner-info">
                <div class="partner-name">${user.name}</div>
                <div class="partner-languages">
                    Habla: ${user.native_language} | Aprende: ${user.learning_language}
                </div>
            </div>
            <div class="partner-actions">
                <button class="btn btn-sm btn-primary" onclick="startConversation(${user.id})">
                    <i class="fas fa-comment"></i> Chatear
                </button>
            </div>
        `;
        partnersList.appendChild(div);
    });
}

async function startConversation(userId) {
    try {
        const response = await fetch(`${API_URL}/conversations/direct`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ userId })
        });
        
        const data = await response.json();
        
        if (data.ok) {
            document.getElementById('findPartnersModal').classList.add('d-none');
            loadConversations();
            
            // Select the new conversation
            setTimeout(() => {
                const newConversation = conversations.find(conv => conv.id === data.conversation.id);
                if (newConversation) {
                    selectConversation(newConversation);
                }
            }, 500);
        }
    } catch (error) {
        console.error('Error starting conversation:', error);
    }
}

// Profile Functions
function showProfileModal() {
    document.getElementById('profileModal').classList.remove('d-none');
    
    // Load current profile data
    document.getElementById('profileName').value = currentUser.name || '';
    document.getElementById('profileCountry').value = currentUser.country || '';
    document.getElementById('profileBio').value = currentUser.bio || '';
    document.getElementById('profileInterests').value = currentUser.interests ? currentUser.interests.join(', ') : '';
    
    if (currentUser.profile_photo) {
        document.getElementById('profilePhotoLarge').src = currentUser.profile_photo;
    }
}

async function saveProfile() {
    const name = document.getElementById('profileName').value;
    const country = document.getElementById('profileCountry').value;
    const bio = document.getElementById('profileBio').value;
    const interestsStr = document.getElementById('profileInterests').value;
    const interests = interestsStr ? interestsStr.split(',').map(i => i.trim()) : [];
    
    try {
        const response = await fetch(`${API_URL}/users/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, country, bio, interests })
        });
        
        const data = await response.json();
        
        if (data.ok) {
            currentUser = data.user;
            localStorage.setItem('chat_user', JSON.stringify(currentUser));
            document.getElementById('currentUserName').textContent = currentUser.name;
            document.getElementById('profileModal').classList.add('d-none');
            Swal.fire('Éxito', 'Perfil actualizado', 'success');
        }
    } catch (error) {
        console.error('Error saving profile:', error);
    }
}

async function handleProfilePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch(`${API_URL}/uploads/profile-photo`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        
        const data = await response.json();
        
        if (data.ok) {
            currentUser.profile_photo = data.profilePhoto;
            localStorage.setItem('chat_user', JSON.stringify(currentUser));
            document.getElementById('profilePhotoLarge').src = data.profilePhoto;
            document.querySelector('#currentUserProfile .profile-photo').src = data.profilePhoto;
        }
    } catch (error) {
        console.error('Error uploading photo:', error);
    }
}

// File Upload Functions
let selectedFiles = [];

function handleFileSelection(event) {
    const files = Array.from(event.target.files);
    selectedFiles = [...selectedFiles, ...files];
    renderSelectedFiles();
}

function renderSelectedFiles() {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';
    
    selectedFiles.forEach((file, index) => {
        const div = document.createElement('div');
        div.className = 'file-item';
        div.innerHTML = `
            <i class="fas fa-file"></i>
            <span class="file-name">${file.name}</span>
            <span class="file-size">${formatFileSize(file.size)}</span>
            <i class="fas fa-times remove-file" onclick="removeFile(${index})"></i>
        `;
        fileList.appendChild(div);
    });
}

function removeFile(index) {
    selectedFiles.splice(index, 1);
    renderSelectedFiles();
}

async function uploadFiles() {
    if (selectedFiles.length === 0 || !currentConversation) return;
    
    for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            // First send a message
            const messageResponse = await fetch(`${API_URL}/conversations/${currentConversation.id}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    content: file.name,
                    messageType: getFileType(file.type)
                })
            });
            
            const messageData = await messageResponse.json();
            
            if (messageData.ok) {
                // Then upload the file
                await fetch(`${API_URL}/uploads/message/${messageData.message.id}`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
            }
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    }
    
    selectedFiles = [];
    renderSelectedFiles();
    document.getElementById('fileUploadModal').classList.add('d-none');
    loadMessages(currentConversation.id);
}

function getFileType(mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('video/')) return 'video';
    return 'document';
}

// Utility Functions
function formatTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'ahora';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    if (diff < 604800000) return date.toLocaleDateString('es-ES', { weekday: 'short' });
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Make functions available globally
window.startConversation = startConversation;
window.removeFile = removeFile;
