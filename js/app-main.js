const STORAGE_KEY = "pangolingo-user";
const PROGRESS_KEY = "pangolingo-progress";

let savedUser = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
let savedProgress = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{\"xp\":40,\"streak\":4,\"completed\":[1]}");

function switchMode(mode) {
  // Ocultar todas las secciones
  document.querySelectorAll('.mode-section').forEach(section => {
    section.classList.remove('active');
  });

  // Mostrar la sección seleccionada
  const modeSection = document.getElementById(`${mode}Mode`);
  if (modeSection) {
    modeSection.classList.add('active');
  }

  // Actualizar estado activo en la navegación
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.mode === mode) {
      item.classList.add('active');
    }
  });
}

function init() {
  if (!savedUser) {
    window.location.href = 'index.html';
    return;
  }

  console.log('Usuario autenticado:', savedUser);
  console.log('Progreso:', savedProgress);

  // Configurar navegación
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const mode = item.dataset.mode;
      switchMode(mode);
    });
  });

  // Configurar modo de traductor (diccionario)
  document.getElementById('searchBtn')?.addEventListener('click', () => {
    const searchWord = document.getElementById('searchWord').value.trim().toLowerCase();
    const resultDiv = document.getElementById('searchResult');
    const notFoundDiv = document.getElementById('wordNotFound');
    const direction = document.querySelector('input[name="translationDirection"]:checked')?.value || 'enToEs';

    if (!searchWord) {
      resultDiv.style.display = 'none';
      notFoundDiv.style.display = 'none';
      return;
    }

    const dictToUse = direction === 'enToEs' ? dictionary : reverseDictionary;
    const sourceLang = direction === 'enToEs' ? 'Inglés' : 'Español';
    const targetLang = direction === 'enToEs' ? 'Español' : 'Inglés';

    if (dictToUse[searchWord]) {
      resultDiv.style.display = 'block';
      resultDiv.innerHTML = `<strong>${searchWord} (${sourceLang}):</strong> ${dictToUse[searchWord]} (${targetLang})`;
      notFoundDiv.style.display = 'none';
    } else {
      resultDiv.style.display = 'none';
      notFoundDiv.style.display = 'block';
      notFoundDiv.textContent = `La palabra "${searchWord}" no se encontró en el diccionario.`;
    }
  });

  // Actualizar placeholder cuando cambia la dirección de traducción
  document.querySelectorAll('input[name="translationDirection"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const searchInput = document.getElementById('searchWord');
      const direction = radio.value;
      searchInput.placeholder = direction === 'enToEs' 
        ? 'Escribe una palabra en inglés...' 
        : 'Escribe una palabra en español...';
    });
  });

  // Permitir búsqueda con Enter
  document.getElementById('searchWord')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('searchBtn').click();
    }
  });

  // Configurar chat
  document.getElementById('sendChatBtn')?.addEventListener('click', () => {
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    const message = chatInput.value.trim();
    if (message) {
      chatMessages.innerHTML += `<div class="mb-2"><strong>Tú:</strong> ${message}</div>`;
      chatInput.value = '';
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  });

  // Configurar cerrar sesión
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PROGRESS_KEY);
    window.location.href = 'index.html';
  });

  // Cargar datos del usuario en configuración
  if (savedUser) {
    const nameInput = document.getElementById('settingsName');
    const emailInput = document.getElementById('settingsEmail');
    if (nameInput) nameInput.value = savedUser.nombre;
    if (emailInput) emailInput.value = savedUser.correo;
  }
}

init();
