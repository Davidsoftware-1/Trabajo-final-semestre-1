// Configuration
const API_URL = 'http://localhost:3001/api';
const SOCKET_URL = 'http://localhost:3001';

// Load Socket.IO client
const socketScript = document.createElement('script');
socketScript.src = 'https://cdn.socket.io/4.8.3/socket.io.min.js';
document.head.appendChild(socketScript);

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
    
    // Navigation tabs
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
    });
    
    // Scroll controls
    document.getElementById('scrollUpBtn').addEventListener('click', () => {
        chatMessages.scrollBy({ top: -200, behavior: 'smooth' });
    });
    
    document.getElementById('scrollDownBtn').addEventListener('click', () => {
        chatMessages.scrollBy({ top: 200, behavior: 'smooth' });
    });
}

function switchTab(tab) {
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tab) {
            btn.classList.add('active');
        }
    });

    // Hide all lists
    document.getElementById('conversationsList').classList.add('d-none');
    document.getElementById('friendsList').classList.add('d-none');
    document.getElementById('discoverList').classList.add('d-none');

    // Show selected list
    switch(tab) {
        case 'conversations':
            document.getElementById('conversationsList').classList.remove('d-none');
            loadConversations();
            break;
        case 'friends':
            document.getElementById('friendsList').classList.remove('d-none');
            loadFriends();
            break;
        case 'discover':
            document.getElementById('discoverList').classList.remove('d-none');
            loadDiscover();
            break;
    }
}

async function loadFriends() {
    try {
        const response = await fetch(`${API_URL}/conversations`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.ok) {
            const friends = data.conversations.map(conv => ({
                id: conv.other_user_id,
                name: conv.display_name,
                profile_photo: conv.display_photo,
                country: conv.other_user_country,
                native_language: conv.other_user_native_language,
                learning_language: conv.other_user_learning_language
            }));
            renderFriends(friends);
        } else {
            document.getElementById('friendsList').innerHTML = '<p class="text-center p-3">No tienes amigos aún</p>';
        }
    } catch (error) {
        console.error('Error loading friends:', error);
        document.getElementById('friendsList').innerHTML = '<p class="text-center p-3">Error al cargar amigos</p>';
    }
}

function renderFriends(friends) {
    const friendsList = document.getElementById('friendsList');

    if (friends.length === 0) {
        friendsList.innerHTML = '<p class="text-center p-3">No tienes amigos aún</p>';
        return;
    }

    friendsList.innerHTML = friends.map(friend => `
        <div class="conversation-item" onclick="startChatWithUser(${friend.id})">
            <img src="${friend.profile_photo || 'https://via.placeholder.com/50'}" alt="${friend.name}" class="conversation-photo">
            <div class="conversation-info">
                <div class="conversation-header">
                    <span class="conversation-name">${friend.name}</span>
                    <span class="conversation-time">${friend.country || ''}</span>
                </div>
                <div class="conversation-preview">
                    <span class="conversation-last-message">${friend.native_language || ''} - ${friend.learning_language || ''}</span>
                </div>
            </div>
        </div>
    `).join('');
}

async function loadDiscover() {
    try {
        const response = await fetch(`${API_URL}/users/search/match`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.ok) {
            renderDiscover(data.users || []);
        } else {
            document.getElementById('discoverList').innerHTML = '<p class="text-center p-3">No hay usuarios disponibles</p>';
        }
    } catch (error) {
        console.error('Error loading discover:', error);
        document.getElementById('discoverList').innerHTML = '<p class="text-center p-3">Error al cargar usuarios</p>';
    }
}

function renderDiscover(users) {
    const discoverList = document.getElementById('discoverList');

    if (users.length === 0) {
        discoverList.innerHTML = '<p class="text-center p-3">No hay usuarios disponibles</p>';
        return;
    }

    discoverList.innerHTML = users.map(user => `
        <div class="conversation-item" onclick="startChatWithUser(${user.id})">
            <img src="${user.profile_photo || 'https://via.placeholder.com/50'}" alt="${user.name}" class="conversation-photo">
            <div class="conversation-info">
                <div class="conversation-header">
                    <span class="conversation-name">${user.name}</span>
                    <span class="conversation-time">${user.country || ''}</span>
                </div>
                <div class="conversation-preview">
                    <span class="conversation-last-message">${user.native_language || ''} - ${user.learning_language || ''}</span>
                </div>
            </div>
        </div>
    `).join('');
}

async function startChatWithUser(userId) {
    try {
        const response = await fetch(`${API_URL}/conversations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ other_user_id: userId })
        });

        const data = await response.json();

        if (data.ok) {
            switchTab('conversations');
            loadConversations();
        } else {
            Swal.fire('Error', data.message || 'No se pudo iniciar la conversación', 'error');
        }
    } catch (error) {
        console.error('Error starting chat:', error);
        Swal.fire('Error', 'No se pudo iniciar la conversación', 'error');
    }
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
        } else {
            Swal.fire('Error', data.message, 'error');
        }
    } catch (error) {
        console.error('Error en login:', error);
        Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
    }
}

async function handleRegister() {
    const name = document.getElementById('registerName').value;
    const countryCode = document.getElementById('registerCountryCode').value;
    const phone = document.getElementById('registerPhone').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const native_language = document.getElementById('nativeLanguage').value;
    const learning_language = document.getElementById('learningLanguage').value;
    const language_level = document.getElementById('languageLevel').value;
    
    if (!name || !phone || !email || !password) {
        Swal.fire('Error', 'Por favor completa todos los campos requeridos', 'error');
        return;
    }

    // Validar número de teléfono (mínimo 7 dígitos)
    const phoneClean = phone.replace(/\s/g, '');
    if (phoneClean.length < 7) {
        Swal.fire('Error', 'Ingresa un número de teléfono válido (mínimo 7 dígitos)', 'error');
        return;
    }

    const phoneComplete = `${countryCode}${phoneClean}`;
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, phone: phoneComplete, native_language, learning_language, language_level })
        });
        
        const data = await response.json();
        
        if (data.ok) {
            token = data.token;
            currentUser = data.user;
            localStorage.setItem('chat_token', token);
            localStorage.setItem('chat_user', JSON.stringify(currentUser));
            showChatInterface();
        } else {
            Swal.fire('Error', data.message, 'error');
        }
    } catch (error) {
        console.error('Error en registro:', error);
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
    
    // Show simple black interface
    document.getElementById('simpleChatInterface').classList.remove('d-none');
    document.getElementById('fullChatInterface').classList.add('d-none');
    
    document.getElementById('currentUserName').textContent = currentUser.nombre;
    document.getElementById('currentUserStatus').textContent = 'en línea';
    
    if (currentUser.profile_photo) {
        document.querySelector('#currentUserProfile .profile-photo').src = currentUser.profile_photo;
    }

    // Setup sidebar navigation
    setupSidebarNavigation();

    // Initialize Socket.IO
    initializeSocket();
}

function setupSidebarNavigation() {
    const navItems = document.querySelectorAll('.simple-sidebar .nav-item');
    const sections = document.querySelectorAll('.content-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            item.classList.add('active');
            
            // Hide all sections
            sections.forEach(section => section.classList.remove('active'));
            
            // Show selected section
            const sectionId = item.dataset.section + 'Section';
            document.getElementById(sectionId).classList.add('active');

            // Load friends when friends section is opened
            if (item.dataset.section === 'friends') {
                loadRecommendedFriends();
            }
        });
    });
}

// Friends Functions
async function loadRecommendedFriends() {
    try {
        const response = await fetch(`${API_URL}/chat/users?userId=${currentUser.id}`);
        const data = await response.json();

        if (data.ok) {
            // Filter users based on user's learning language
            const learningLanguage = currentUser.learning_language || 'en';
            const recommendedUsers = data.users.filter(user => 
                user.native_language === learningLanguage
            );

            renderFriendsList(recommendedUsers);
        }
    } catch (error) {
        console.error('Error loading friends:', error);
    }
}

function renderFriendsList(users) {
    const friendsList = document.getElementById('friendsList');
    friendsList.innerHTML = '';

    if (users.length === 0) {
        friendsList.innerHTML = `
            <div class="no-friends">
                <i class="fas fa-user-friends"></i>
                <p>No hay usuarios recomendados por ahora</p>
            </div>
        `;
        return;
    }

    users.forEach(user => {
        const card = document.createElement('div');
        card.className = 'friend-card';
        card.innerHTML = `
            <div class="friend-card-header">
                <div class="friend-avatar">
                    ${user.nombre.charAt(0).toUpperCase()}
                </div>
                <div class="friend-info">
                    <h3>${user.nombre}</h3>
                </div>
            </div>
            <div class="friend-languages">
                <span class="language-badge">Nativo: ${getLanguageName(user.native_language)}</span>
                <span class="language-badge">Aprendiendo: ${getLanguageName(user.learning_language)}</span>
            </div>
            <div class="friend-level">Nivel: ${user.language_level}</div>
            <div class="friend-actions">
                <button class="btn-start-chat" onclick="startChatWithUser(${user.id})">
                    <i class="fas fa-comments"></i> Iniciar chat
                </button>
            </div>
        `;
        friendsList.appendChild(card);
    });
}

function getLanguageName(code) {
    const languages = {
        'es': 'Español',
        'en': 'Inglés',
        'fr': 'Francés',
        'de': 'Alemán',
        'it': 'Italiano',
        'pt': 'Portugués',
        'zh': 'Chino',
        'ja': 'Japonés'
    };
    return languages[code] || code;
}

async function startChatWithUser(userId) {
    try {
        const response = await fetch(`${API_URL}/chat/conversations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                userId: currentUser.id,
                participantId: userId
            })
        });

        const data = await response.json();

        if (data.ok) {
            // Switch to chats section
            document.querySelector('[data-section="friends"]').classList.remove('active');
            document.querySelector('[data-section="chats"]').classList.add('active');
            document.getElementById('friendsSection').classList.remove('active');
            document.getElementById('chatsSection').classList.add('active');
            
            // Load conversations
            loadConversations();
            
            Swal.fire('Éxito', 'Conversación creada', 'success');
        }
    } catch (error) {
        console.error('Error starting chat:', error);
        Swal.fire('Error', 'No se pudo iniciar el chat', 'error');
    }
}

// Search friends functionality
document.addEventListener('DOMContentLoaded', () => {
    const searchFriendsInput = document.getElementById('searchFriends');
    if (searchFriendsInput) {
        searchFriendsInput.addEventListener('input', async (e) => {
            const query = e.target.value;
            if (query.length > 2) {
                try {
                    const response = await fetch(`${API_URL}/chat/users?userId=${currentUser.id}&query=${query}`);
                    const data = await response.json();
                    if (data.ok) {
                        renderFriendsList(data.users);
                    }
                } catch (error) {
                    console.error('Error searching friends:', error);
                }
            } else if (query.length === 0) {
                loadRecommendedFriends();
            }
        });
    }
});

// Socket.IO Functions
function initializeSocket() {
    if (typeof io === 'undefined') {
        console.error('Socket.IO not loaded');
        return;
    }

    socket = io(SOCKET_URL, {
        auth: { token }
    });
    
    socket.on('connect', () => {
        console.log('Connected to server');
        socket.emit('user:join', currentUser.id);
        loadConversations();
    });
    
    socket.on('disconnect', () => {
        console.log('Disconnected from server');
    });
    
    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
    
    socket.on('message:new', (message) => {
        if (currentConversation && currentConversation.id === message.conversationId) {
            appendMessage(message);
            markMessagesAsRead(message.id);
        } else {
            loadConversations();
        }
    });
    
    socket.on('message:read', (data) => {
        updateMessageStatus(data.messageId, 'read');
    });
    
    socket.on('user:typing', (data) => {
        if (currentConversation && currentConversation.id === data.conversationId) {
            showTypingIndicator(data.isTyping);
        }
    });
    
    socket.on('user:status', (data) => {
        updateUserStatusInList(data.userId, data.status);
        if (currentConversation) {
            const otherUserId = currentConversation.participants.find(id => id !== currentUser.id);
            if (otherUserId === data.userId) {
                document.getElementById('activeContactStatus').textContent = 
                    data.status === 'online' ? 'en línea' : 'desconectado';
            }
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
        const response = await fetch(`${API_URL}/chat/conversations?userId=${currentUser.id}`, {
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
    const conversationsList = document.getElementById('conversationsList');
    conversationsList.innerHTML = '';
    
    if (conversations.length === 0) {
        conversationsList.innerHTML = `
            <div class="no-conversations">
                <p>No tienes conversaciones aún</p>
            </div>
        `;
        return;
    }
    
    conversations.forEach(conversation => {
        const otherUserId = conversation.participants.find(id => id !== currentUser.id);
        const div = document.createElement('div');
        div.className = `conversation-item ${currentConversation && currentConversation.id === conversation.id ? 'active' : ''}`;
        div.innerHTML = `
            <div class="conversation-avatar">
                ${getInitials(otherUserId)}
            </div>
            <div class="conversation-info">
                <div class="conversation-name">Usuario ${otherUserId}</div>
                <div class="conversation-last-message">${conversation.lastMessage || 'Sin mensajes'}</div>
            </div>
            <div class="conversation-time">
                ${formatTime(conversation.lastMessageAt)}
            </div>
        `;
        
        div.addEventListener('click', () => selectConversation(conversation));
        conversationsList.appendChild(div);
    });
}

function getInitials(userId) {
    return userId.toString().charAt(0).toUpperCase();
}

function formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Ahora';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString();
}

async function selectConversation(conversation) {
    currentConversation = conversation;
    
    // Update UI
    document.getElementById('noConversationSelected').classList.add('d-none');
    document.getElementById('activeConversation').classList.remove('d-none');
    
    const otherUserId = conversation.participants.find(id => id !== currentUser.id);
    document.getElementById('activeContactAvatar').textContent = getInitials(otherUserId);
    document.getElementById('activeContactName').textContent = `Usuario ${otherUserId}`;
    
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
        const response = await fetch(`${API_URL}/chat/conversations/${conversationId}/messages`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        if (data.ok) {
            const chatMessages = document.getElementById('chatMessages');
            chatMessages.innerHTML = '';
            data.messages.forEach(message => {
                appendMessage(message);
            });
            scrollToBottom();
        }
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

// Message Functions
async function sendMessage() {
    const content = document.getElementById('messageInput').value.trim();
    
    if (!content || !currentConversation || !socket) return;

    socket.emit('message:send', {
        conversationId: currentConversation.id,
        senderId: currentUser.id,
        content
    });
    
    document.getElementById('messageInput').value = '';

    // Stop typing indicator
    if (typingTimeout) {
        clearTimeout(typingTimeout);
        socket.emit('typing:stop', currentConversation.id);
    }
}

function appendMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    const isSent = message.senderId === currentUser.id;
    
    const div = document.createElement('div');
    div.className = `message ${isSent ? 'sent' : 'received'}`;
    div.innerHTML = `
        <div class="message-content">${message.content}</div>
        <div class="message-time">${formatTime(message.timestamp)}</div>
    `;
    
    chatMessages.appendChild(div);
    scrollToBottom();
}

function scrollToBottom() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator(isTyping) {
    const indicator = document.getElementById('typingIndicator');
    if (isTyping) {
        indicator.classList.add('show');
    } else {
        indicator.classList.remove('show');
    }
}

function markMessagesAsRead(messageId) {
    if (socket) {
        socket.emit('message:read', { messageId });
    }
}

function updateMessageStatus(messageId, status) {
    // Update message status in UI
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (messageElement) {
        // Add status indicator
    }
}

function updateUserStatusInList(userId, status) {
    // Update user status in conversations list
    renderConversations();
}

// Setup chat event listeners
function setupChatEventListeners() {
    // Send message button
    const sendBtn = document.getElementById('sendMessageBtn');
    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }

    // Message input - send on Enter
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        // Typing indicator
        messageInput.addEventListener('input', () => {
            if (socket && currentConversation) {
                socket.emit('typing:start', {
                    conversationId: currentConversation.id,
                    userId: currentUser.id
                });

                if (typingTimeout) {
                    clearTimeout(typingTimeout);
                }

                typingTimeout = setTimeout(() => {
                    if (socket && currentConversation) {
                        socket.emit('typing:stop', {
                            conversationId: currentConversation.id,
                            userId: currentUser.id
                        });
                    }
                }, 1000);
            }
        });
    }

    // New chat button
    const newChatBtn = document.getElementById('newChatBtn');
    if (newChatBtn) {
        newChatBtn.addEventListener('click', () => {
            // Switch to friends section
            document.querySelector('[data-section="chats"]').classList.remove('active');
            document.querySelector('[data-section="friends"]').classList.add('active');
            document.getElementById('chatsSection').classList.remove('active');
            document.getElementById('friendsSection').classList.add('active');
            loadRecommendedFriends();
        });
    }
}

// Call setup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setupChatEventListeners();
});
