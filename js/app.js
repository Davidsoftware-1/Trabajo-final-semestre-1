const STORAGE_KEY = "pangolingo-user";
const PROGRESS_KEY = "pangolingo-progress";
const API_URL = "/api";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email || "").trim().toLowerCase());
}

const lessons = [
  { id: 1, title: "Saludos", level: "Básico", xp: 15, prompt: "¿Cómo se traduce 'Hello' al español?", options: ["Hola", "Casa", "Correr", "Luna"], answer: "Hola" },
  { id: 2, title: "Comida", level: "Fácil", xp: 20, prompt: "¿Qué significa 'apple' en español?", options: ["Manzana", "Pan", "Agua", "Libro"], answer: "Manzana" },
  { id: 3, title: "Viajes", level: "Intermedio", xp: 25, prompt: "¿Cómo se dice 'airport' en español?", options: ["Aeropuerto", "Museo", "Plaza", "Calle"], answer: "Aeropuerto" },
  { id: 4, title: "Emociones", level: "Premium", xp: 30, prompt: "¿Qué significa 'happy' en español?", options: ["Feliz", "Triste", "Enojado", "Dormido"], answer: "Feliz" }
];

let savedUser = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
let savedProgress = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{\"xp\":40,\"streak\":4,\"completed\":[1]}");
let currentLesson = null;

async function api(path, options = {}) {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    });

    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    console.error(`[API] Error de red en ${path}:`, error);
    return { ok: false, status: 0, data: { message: 'No se pudo conectar con el servidor. Revisa que esté corriendo en localhost:3000.' }, networkError: error };
  }
}

function updateProgressUI(progress = savedProgress) {
  const xpValue = document.getElementById("xpValue");
  const streakValue = document.getElementById("streakValue");
  const levelValue = document.getElementById("levelValue");
  const weekProgressBar = document.getElementById("weekProgressBar");
  const weekProgressText = document.getElementById("weekProgressText");

  const xp = progress.xp || 0;
  const streak = progress.streak || 0;
  const level = Math.min(10, Math.floor(xp / 100) + 1);
  const weekPercent = Math.min(100, Math.round((xp % 100) / 100 * 100));

  xpValue.textContent = xp;
  streakValue.textContent = streak;
  levelValue.textContent = level;
  weekProgressBar.style.width = `${weekPercent}%`;
  weekProgressText.textContent = `${weekPercent}% completado`;
}

function renderLessons() {
  const lessonList = document.getElementById("lessonList");
  lessonList.innerHTML = lessons.map((lesson) => `
    <article class="lesson-card">
      <span class="lesson-pill">${lesson.level}</span>
      <h3>${lesson.title}</h3>
      <p>${lesson.prompt}</p>
      <button class="btn btn-outline-light btn-sm mt-2" data-action="practice" data-id="${lesson.id}">Practicar</button>
    </article>
  `).join("");
}

function showPractice(lessonId) {
  currentLesson = lessons.find((lesson) => lesson.id === Number(lessonId));
  if (!currentLesson) return;
  document.getElementById("practicePrompt").textContent = currentLesson.prompt;
  document.getElementById("practiceFeedback").textContent = "Elige una respuesta para ganar XP.";
  document.getElementById("optionButtons").innerHTML = currentLesson.options.map((option) => `<button class="option-btn" data-choice="${option}">${option}</button>`).join("");
}

async function answerQuestion(choice) {
  if (!currentLesson) {
    Swal.fire({ title: "Elige una lección", icon: "info", text: "Primero selecciona una lección para practicar." });
    return;
  }

  const isCorrect = choice === currentLesson.answer;
  const nextProgress = {
    xp: (savedProgress.xp || 0) + (isCorrect ? currentLesson.xp : 5),
    streak: isCorrect ? (savedProgress.streak || 0) + 1 : Math.max(0, (savedProgress.streak || 0) - 1),
    completed: Array.from(new Set([...(savedProgress.completed || []), currentLesson.id]))
  };

  savedProgress = nextProgress;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(savedProgress));

  if (savedUser) {
    await api(`/progress/${encodeURIComponent(savedUser.correo)}`, {
      method: 'PUT',
      body: JSON.stringify(nextProgress)
    });
  }

  updateProgressUI(nextProgress);
  document.getElementById("practiceFeedback").textContent = isCorrect
    ? "Muy bien. Sigue así y sube de nivel."
    : `La respuesta correcta era ${currentLesson.answer}.`;

  Swal.fire({
    title: isCorrect ? "¡Correcto!" : "Casi",
    text: isCorrect
      ? `Ganaste ${currentLesson.xp} XP con la lección ${currentLesson.title}.`
      : `La respuesta correcta era ${currentLesson.answer}. Ganas 5 XP por intentarlo.`,
    icon: isCorrect ? "success" : "info"
  });
}

function loadUserDashboard(user, progress = savedProgress) {
  const userNameLabel = document.getElementById("userNameLabel");
  const userEmailLabel = document.getElementById("userEmailLabel");
  const welcomeMessage = document.getElementById("welcomeMessage");
  const dashboardSection = document.getElementById("dashboardSection");

  dashboardSection.classList.remove("d-none");
  userNameLabel.textContent = `Hola, ${user.nombre}`;
  userEmailLabel.textContent = `Cuenta activa: ${user.correo}`;
  welcomeMessage.textContent = `Bienvenido de vuelta, ${user.nombre}. Tu aventura continúa.`;
  welcomeMessage.classList.remove("d-none");
  updateProgressUI(progress);
}

async function registerUser(event) {
  event.preventDefault();

  const nombre = document.getElementById("nombreJugador").value.trim();
  const correo = document.getElementById("correoJugador").value.trim();
  const password = document.getElementById("passwordJugador").value.trim();

  if (!nombre || !correo || password.length < 6) {
    Swal.fire({ title: "Datos incompletos", text: "Completa todos los campos y usa una contraseña de al menos 6 caracteres.", icon: "warning" });
    return;
  }

  if (!isValidEmail(correo)) {
    Swal.fire({ title: "Correo no válido", text: "Ingresa un correo real, por ejemplo usuario@empresa.com.", icon: "error" });
    return;
  }

  const result = await api('/register', { method: 'POST', body: JSON.stringify({ nombre, correo, password }) });
  console.log('[REGISTER] Respuesta del servidor:', result);

  if (!result.ok) {
    if (result.status === 409) {
      Swal.fire({ title: "Correo ya registrado", text: result.data.message || 'Ese correo ya tiene una cuenta. Inicia sesión.', icon: 'warning' });
    } else if (result.status === 400) {
      Swal.fire({ title: "Datos no válidos", text: result.data.message || 'Revisa los datos e intenta de nuevo.', icon: 'error' });
    } else {
      console.error('[REGISTER] Error del servidor:', result.data.error || result.data.message, result.networkError || '');
      Swal.fire({ title: "Error del servidor", text: result.data.message || 'Ocurrió un error inesperado. Intenta nuevamente.', icon: 'error' });
    }
    return;
  }

  const user = result.data.user;
  savedUser = { id: user.id, nombre: user.nombre, correo: user.correo, provider: user.provider };
  savedProgress = { xp: user.xp || 40, streak: user.streak || 4, completed: user.completed || [1] };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedUser));
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(savedProgress));

  loadUserDashboard(savedUser, savedProgress);
  Swal.fire({ title: "Usuario creado", text: `¡Bienvenido a Pangolingo, ${savedUser.nombre}! Tu cuenta quedó guardada.`, icon: 'success' });
}

async function loginUser(event) {
  event.preventDefault();

  const correo = document.getElementById("loginCorreo").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (!correo || !password) {
    Swal.fire({ title: "Campos incompletos", text: "Ingresa tu correo y contraseña para entrar.", icon: "warning" });
    return;
  }

  if (!isValidEmail(correo)) {
    Swal.fire({ title: "Correo no válido", text: "Ingresa un correo con formato correcto.", icon: "error" });
    return;
  }

  const result = await api('/login', { method: 'POST', body: JSON.stringify({ correo, password }) });
  if (!result.ok) {
    Swal.fire({ title: "Acceso denegado", text: result.data.message || 'Revisa tus credenciales.', icon: 'error' });
    return;
  }

  const user = result.data.user;
  savedUser = { id: user.id, nombre: user.nombre, correo: user.correo, provider: user.provider };
  savedProgress = { xp: user.xp || 40, streak: user.streak || 4, completed: user.completed || [1] };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedUser));
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(savedProgress));

  await Swal.fire({ title: "Sesión iniciada", text: `Bienvenido de nuevo, ${savedUser.nombre}.`, icon: "success", timer: 1200, showConfirmButton: false });
  window.location.href = "inicio.html";
}

async function recoverAccount() {
  const { value: formValues, isConfirmed } = await Swal.fire({
    title: "Recuperar cuenta",
    html: `
      <input id="recoveryCorreo" class="swal2-input" type="email" placeholder="Correo registrado">
      <input id="recoveryPassword" class="swal2-input" type="password" placeholder="Nueva contraseña">
    `,
    confirmButtonText: "Actualizar contraseña",
    showCancelButton: true,
    cancelButtonText: "Cancelar",
    focusConfirm: false,
    preConfirm: () => {
      const correo = document.getElementById("recoveryCorreo").value.trim();
      const password = document.getElementById("recoveryPassword").value.trim();

      if (!correo || !password) {
        Swal.showValidationMessage("Escribe tu correo y la nueva contraseña.");
        return false;
      }

      if (!isValidEmail(correo)) {
        Swal.showValidationMessage("Ingresa un correo con formato correcto.");
        return false;
      }

      if (password.length < 6) {
        Swal.showValidationMessage("La nueva contraseña debe tener al menos 6 caracteres.");
        return false;
      }

      return { correo, password };
    }
  });

  if (!isConfirmed || !formValues) return;

  const result = await api('/recover-account', {
    method: 'POST',
    body: JSON.stringify(formValues)
  });

  if (!result.ok) {
    Swal.fire({ title: "No se pudo recuperar", text: result.data.message || "Revisa el correo e intenta nuevamente.", icon: "error" });
    return;
  }

  document.getElementById("loginCorreo").value = formValues.correo;
  document.getElementById("loginPassword").value = "";
  Swal.fire({ title: "Cuenta recuperada", text: "Tu contraseña fue actualizada. Ya puedes iniciar sesión con la nueva clave.", icon: "success" });
}

async function restoreSession() {
  if (!savedUser) return;
  const progressResult = await api(`/progress/${encodeURIComponent(savedUser.correo)}`);
  if (progressResult.ok) {
    savedProgress = progressResult.data;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(savedProgress));
    loadUserDashboard(savedUser, savedProgress);
  }
}

function init() {
  renderLessons();
  updateProgressUI(savedProgress);

  document.getElementById("tabRegister").addEventListener("click", () => {
    document.getElementById("registerPanel").classList.remove("d-none");
    document.getElementById("loginPanel").classList.add("d-none");
    document.getElementById("tabRegister").classList.add("active");
    document.getElementById("tabLogin").classList.remove("active");
  });

  document.getElementById("tabLogin").addEventListener("click", () => {
    document.getElementById("registerPanel").classList.add("d-none");
    document.getElementById("loginPanel").classList.remove("d-none");
    document.getElementById("tabLogin").classList.add("active");
    document.getElementById("tabRegister").classList.remove("active");
  });

  document.getElementById("registroForm").addEventListener("submit", registerUser);
  document.getElementById("loginForm").addEventListener("submit", loginUser);
  document.getElementById("forgotPasswordBtn").addEventListener("click", recoverAccount);
  document.getElementById("lessonList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-action='practice']");
    if (button) showPractice(button.dataset.id);
  });
  document.getElementById("optionButtons").addEventListener("click", (event) => {
    const button = event.target.closest(".option-btn");
    if (button) answerQuestion(button.dataset.choice);
  });
  document.getElementById("challengeBtn").addEventListener("click", () => {
    Swal.fire({ title: "Reto del día", text: "Responde 3 preguntas rápidas y gana 30 XP extra en tu próxima sesión.", icon: "info" });
  });

  restoreSession();
}

init();
