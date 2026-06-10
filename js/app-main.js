const STORAGE_KEY = "pangolingo-user";
const PROGRESS_KEY = "pangolingo-progress";

let savedUser = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
let savedProgress = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{\"xp\":40,\"streak\":4,\"completed\":[1]}");
let useAPIForTranslation = true; // Por defecto usar APIs cuando no esté en diccionario

// Función para cargar scripts dinámicamente
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

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

  // Configurar botones de lectura de historias
  document.querySelectorAll('.story-item .btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const storyItem = e.target.closest('.story-item');
      const storyId = storyItem.dataset.story;
      openStory(storyId);
    });
  });

  // Configurar click en items de historia también
  document.querySelectorAll('.story-item').forEach(item => {
    item.addEventListener('click', () => {
      const storyId = item.dataset.story;
      openStory(storyId);
    });
  });

  // Configurar modo de traductor (diccionario + APIs)
  document.getElementById('searchBtn')?.addEventListener('click', async () => {
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
    const sourceLangCode = direction === 'enToEs' ? 'en' : 'es';
    const targetLangCode = direction === 'enToEs' ? 'es' : 'en';

    // Primero buscar en el diccionario local
    if (dictToUse[searchWord]) {
      resultDiv.style.display = 'block';
      resultDiv.innerHTML = `
        <div class="local-result">
          <strong>${searchWord} (${sourceLang}):</strong> ${dictToUse[searchWord]} (${targetLang})
          <small class="text-muted d-block mt-1">Fuente: Diccionario local</small>
        </div>
      `;
      notFoundDiv.style.display = 'none';
      return;
    }

    // Si no está en el diccionario local y está habilitado el uso de APIs
    if (useAPIForTranslation) {
      resultDiv.style.display = 'block';
      resultDiv.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Traduciendo...</span></div>';
      notFoundDiv.style.display = 'none';

      try {
        // Usar el endpoint del servidor para traducción
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: searchWord,
            sourceLang: sourceLangCode,
            targetLang: targetLangCode
          })
        });

        const result = await response.json();

        if (result.ok) {
          resultDiv.innerHTML = `
            <div class="api-result">
              <strong>${searchWord} (${sourceLang}):</strong> ${result.translatedText} (${targetLang})
              <small class="text-muted d-block mt-1">Fuente: ${result.source} API</small>
            </div>
          `;
          notFoundDiv.style.display = 'none';
        } else {
          resultDiv.style.display = 'none';
          notFoundDiv.style.display = 'block';
          notFoundDiv.textContent = `No se pudo traducir "${searchWord}". Error: ${result.message}`;
        }
      } catch (error) {
        console.error('Error al traducir con API:', error);
        resultDiv.style.display = 'none';
        notFoundDiv.style.display = 'block';
        notFoundDiv.textContent = `Error al conectar con el servicio de traducción: ${error.message}`;
      }
    } else {
      resultDiv.style.display = 'none';
      notFoundDiv.style.display = 'block';
      notFoundDiv.textContent = `La palabra "${searchWord}" no se encontró en el diccionario local.`;
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

  // Configurar cerrar sesión
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PROGRESS_KEY);
    window.location.href = 'index.html';
  });

  // Configurar navegación de niveles
  const levelsData = {
    a1: {
      label: 'A1 - Principiante',
      title: 'Nivel A1 - Principiante',
      description: 'Frases básicas y vocabulario simple. Comienza tu viaje en inglés.'
    },
    a2: {
      label: 'A2 - Elemental',
      title: 'Nivel A2 - Elemental',
      description: 'Conversaciones cotidianas sencillas. Amplía tu vocabulario básico.'
    },
    b1: {
      label: 'B1 - Intermedio',
      title: 'Nivel B1 - Intermedio',
      description: 'Entender puntos principales en situaciones familiares.'
    },
    b2: {
      label: 'B2 - Intermedio Alto',
      title: 'Nivel B2 - Intermedio Alto',
      description: 'Fluidez en conversaciones y textos complejos.'
    },
    c1: {
      label: 'C1 - Avanzado',
      title: 'Nivel C1 - Avanzado',
      description: 'Comprensión y expresión efectiva en diversos contextos.'
    },
    c2: {
      label: 'C2 - Nativo',
      title: 'Nivel C2 - Nativo',
      description: 'Dominio completo del idioma como hablante nativo.'
    }
  };

  // Manejar click en nodos de nivel
  document.querySelectorAll('.level-node').forEach(node => {
    node.addEventListener('click', () => {
      const level = node.dataset.level;
      if (levelsData[level]) {
        showLevelView(level);
      }
    });
  });

  // Manejar botón de volver a niveles
  document.getElementById('backToLevels')?.addEventListener('click', () => {
    document.getElementById('challengesMode').classList.add('active');
    document.getElementById('levelView').classList.remove('active');
  });

  function showLevelView(level) {
    const levelInfo = levelsData[level];
    if (!levelInfo) return;

    document.getElementById('currentLevelLabel').textContent = levelInfo.label;
    document.getElementById('currentLevelTitle').textContent = levelInfo.title;
    document.getElementById('currentLevelDescription').textContent = levelInfo.description;

    // Generar retos para el nivel A1, A2, B1, B2, C1 y C2
    const levelChallengesContainer = document.querySelector('.level-challenges-container');
    if (levelChallengesContainer) {
      if ((level === 'a1' && typeof a1Challenges !== 'undefined') || 
          (level === 'a2' && typeof a2Challenges !== 'undefined') ||
          (level === 'b1' && typeof b1Challenges !== 'undefined') ||
          (level === 'b2' && typeof b2Challenges !== 'undefined') ||
          (level === 'c1' && typeof c1Challenges !== 'undefined') ||
          (level === 'c2' && typeof cNativeChallenges !== 'undefined')) {
        // Mostrar retos de A1, A2, B1, B2, C1 o C2
        let challenges;
        if (level === 'a1') challenges = a1Challenges;
        else if (level === 'a2') challenges = a2Challenges;
        else if (level === 'b1') challenges = b1Challenges;
        else if (level === 'b2') challenges = b2Challenges;
        else if (level === 'c1') challenges = c1Challenges;
        else if (level === 'c2') challenges = cNativeChallenges;
        levelChallengesContainer.innerHTML = `
          <div class="challenges-path">
            <div class="challenges-line"></div>
            <div class="challenges-container" id="levelChallengesContainer">
              <!-- Challenges will be generated here -->
            </div>
          </div>
        `;

        const challengesContainer = document.getElementById('levelChallengesContainer');
        challenges.forEach((challenge, index) => {
          const challengeNode = document.createElement('div');
          challengeNode.className = `challenge-node ${challenge.type === 'evaluation' ? 'evaluation' : ''}`;
          challengeNode.innerHTML = `
            <div class="challenge-icon">${challenge.type === 'evaluation' ? '🏆' : '⭐'}</div>
            <div class="challenge-number">${index + 1}</div>
            <div class="challenge-info">
              <div class="challenge-title">${challenge.title}</div>
              <div class="challenge-desc">${challenge.description}</div>
              <div class="challenge-stats">
                <span class="success-rate">Éxito: ${challenge.successRate}%</span>
                <span class="xp-reward">+${challenge.xp} XP</span>
              </div>
            </div>
          `;
          challengeNode.dataset.challengeId = challenge.id;
          challengeNode.dataset.level = level;
          
          // Marcar retos completados
          if (savedProgress.completed && savedProgress.completed.includes(challenge.id)) {
            challengeNode.classList.add('completed');
          }
          
          challengesContainer.appendChild(challengeNode);
        });
      } else {
        // Para otros niveles, mostrar el caminito de 30 lecciones
        levelChallengesContainer.innerHTML = `
          <div class="lessons-path">
            <div class="lessons-container" id="levelLessonsContainer">
              <!-- Lessons 1-30 will be generated here -->
            </div>
          </div>
        `;

        const lessonsContainer = document.getElementById('levelLessonsContainer');
        for (let i = 1; i <= 30; i++) {
          const lessonNode = document.createElement('div');
          lessonNode.className = 'lesson-node';
          lessonNode.textContent = i;
          lessonNode.dataset.lesson = i;
          lessonNode.dataset.level = level;
          
          // Marcar lecciones completadas
          if (savedProgress.completed && savedProgress.completed.includes(`${level}-${i}`)) {
            lessonNode.classList.add('completed');
          }
          
          lessonsContainer.appendChild(lessonNode);
        }
      }
    }

    document.getElementById('challengesMode').classList.remove('active');
    document.getElementById('levelView').classList.add('active');
  }

  // Cargar datos del usuario en configuración
  if (savedUser) {
    const nameInput = document.getElementById('settingsName');
    const emailInput = document.getElementById('settingsEmail');
    if (nameInput) nameInput.value = savedUser.nombre;
    if (emailInput) emailInput.value = savedUser.correo;
  }

  // Manejar click en cajas de nivel
  document.querySelectorAll('.level-box').forEach(box => {
    box.addEventListener('click', (e) => {
      const level = box.dataset.level;
      if (levelsData[level]) {
        showLevelView(level);
      }
    });
  });

  // Manejar click en nodos de reto
  document.addEventListener('click', (e) => {
    const challengeNode = e.target.closest('.challenge-node');
    if (challengeNode) {
      const challengeId = challengeNode.dataset.challengeId;
      const level = challengeNode.dataset.level;
      startChallenge(challengeId, level);
    }
  });

  let currentChallenge = null;
  let currentQuestionIndex = 0;
  let correctAnswers = 0;

  function startChallenge(challengeId, level) {
    if ((level === 'a1' && typeof a1Challenges !== 'undefined') || 
        (level === 'a2' && typeof a2Challenges !== 'undefined') ||
        (level === 'b1' && typeof b1Challenges !== 'undefined') ||
        (level === 'b2' && typeof b2Challenges !== 'undefined') ||
        (level === 'c1' && typeof c1Challenges !== 'undefined') ||
        (level === 'c2' && typeof cNativeChallenges !== 'undefined')) {
      let challenges;
      if (level === 'a1') challenges = a1Challenges;
      else if (level === 'a2') challenges = a2Challenges;
      else if (level === 'b1') challenges = b1Challenges;
      else if (level === 'b2') challenges = b2Challenges;
      else if (level === 'c1') challenges = c1Challenges;
      else if (level === 'c2') challenges = cNativeChallenges;
      const challenge = challenges.find(c => c.id === challengeId);
      if (challenge) {
        currentChallenge = challenge;
        currentQuestionIndex = 0;
        correctAnswers = 0;
        showQuestion();
      }
    }
  }

  function showQuestion() {
    if (!currentChallenge || currentQuestionIndex >= currentChallenge.questions.length) {
      finishChallenge();
      return;
    }

    const question = currentChallenge.questions[currentQuestionIndex];
    const isEvaluation = currentChallenge.type === 'evaluation';

    Swal.fire({
      title: isEvaluation ? `Evaluación - Pregunta ${currentQuestionIndex + 1}/${currentChallenge.questions.length}` : `${currentChallenge.title} - Pregunta ${currentQuestionIndex + 1}/${currentChallenge.questions.length}`,
      html: `
        <div style="text-align: left; margin: 20px 0;">
          <p style="font-size: 1.1rem; color: #fff;">${question.prompt}</p>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px;">
          ${question.options.map(option => `
            <button class="swal2-confirm swal2-styled" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; padding: 12px; border-radius: 8px; cursor: pointer; transition: all 0.2s;" onclick="answerQuestion('${option.replace(/'/g, "\\'")}')">
              ${option}
            </button>
          `).join('')}
        </div>
      `,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: 'Salir',
      background: '#1a1a1a',
      color: '#fff'
    });
  }

  window.answerQuestion = function(answer) {
    if (!currentChallenge) return;

    const question = currentChallenge.questions[currentQuestionIndex];
    const isCorrect = answer === question.answer;

    if (isCorrect) {
      correctAnswers++;
    }

    currentQuestionIndex++;
    showQuestion();
  };

  function finishChallenge() {
    if (!currentChallenge) return;

    const totalQuestions = currentChallenge.questions.length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = percentage >= 70;
    const isEvaluation = currentChallenge.type === 'evaluation';

    let message = '';
    if (isEvaluation) {
      if (passed) {
        message = `¡Felicitaciones! Has aprobado la evaluación con ${percentage}% de respuestas correctas. Has dominado los conceptos de esta unidad.`;
      } else {
        message = `Has obtenido ${percentage}% en la evaluación. Necesitas repasar los conceptos antes de continuar. Intenta nuevamente.`;
      }
    } else {
      if (passed) {
        message = `¡Excelente! Has completado el reto con ${percentage}% de respuestas correctas. Ganas ${currentChallenge.xp} XP.`;
      } else {
        message = `Has obtenido ${percentage}% en el reto. Sigue practicando para mejorar. Ganas 5 XP por el esfuerzo.`;
      }
    }

    // Marcar reto como completado si pasó
    if (passed) {
      savedProgress.completed = savedProgress.completed || [];
      if (!savedProgress.completed.includes(currentChallenge.id)) {
        savedProgress.completed.push(currentChallenge.id);
      }
      savedProgress.xp = (savedProgress.xp || 0) + (passed ? currentChallenge.xp : 5);
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(savedProgress));
      
      // Actualizar UI
      const challengeNode = document.querySelector(`[data-challenge-id="${currentChallenge.id}"]`);
      if (challengeNode) {
        challengeNode.classList.add('completed');
      }
    }

    Swal.fire({
      title: passed ? '¡Completado!' : 'Reto finalizado',
      text: message,
      icon: passed ? 'success' : 'info',
      background: '#1a1a1a',
      color: '#fff'
    }).then(() => {
      currentChallenge = null;
      currentQuestionIndex = 0;
      correctAnswers = 0;
    });
  }

  // Manejar click en nodos de lección
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('lesson-node')) {
      const lessonNum = e.target.dataset.lesson;
      const level = e.target.dataset.level;
      Swal.fire({
        title: `Lección ${lessonNum} - Nivel ${level.toUpperCase()}`,
        text: 'Esta lección estará disponible pronto.',
        icon: 'info'
      });
    }
  });

  // Configurar botón de grabar respuesta (Speaking)
  document.querySelector('.speaking-container button')?.addEventListener('click', () => {
    Swal.fire({
      title: 'Grabación',
      text: 'Función de grabación de voz próximamente disponible.',
      icon: 'info'
    });
  });

  // Configurar botón de leer historia (Story)
  document.querySelector('.story-container button')?.addEventListener('click', () => {
    Swal.fire({
      title: 'Historia',
      text: 'Las historias estarán disponibles pronto.',
      icon: 'info'
    });
  });
}

function openStory(storyId) {
  const story = getStory(storyId);
  if (!story) {
    Swal.fire('Error', 'Story not found', 'error');
    return;
  }

  Swal.fire({
    title: story.title,
    html: story.content,
    width: '90%',
    maxWidth: '800px',
    customClass: {
      popup: 'story-modal'
    },
    showCloseButton: true,
    showConfirmButton: false,
    scrollbarPadding: false
  });
}

init();
