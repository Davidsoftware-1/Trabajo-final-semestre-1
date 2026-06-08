const STORAGE_KEY = "pangolingo-user";
const PROGRESS_KEY = "pangolingo-progress";
const API_URL = "/api";
const LEVEL_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"];

let savedUser = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
let savedProgress = normalizeProgress(JSON.parse(localStorage.getItem(PROGRESS_KEY) || "null"));
let selectedLevel = savedProgress.assignedLevel || "A1";
let selectedUnitId = savedProgress.currentUnit || "A1-U1";
let unitSession = {};

function defaultProgress() {
  return {
    xp: 40,
    streak: 4,
    completed: [],
    assignedLevel: null,
    diagnosticCompleted: false,
    currentLevel: "A1",
    currentUnit: "A1-U1",
    academicProgress: {
      completedUnits: [],
      completedQuizzes: [],
      passedExams: [],
      scores: {},
      validatedActivities: {}
    }
  };
}

function normalizeProgress(progress) {
  const base = defaultProgress();
  const next = {
    ...base,
    ...(progress || {}),
    academicProgress: {
      ...base.academicProgress,
      ...((progress && progress.academicProgress) || {})
    }
  };
  next.currentLevel = next.currentLevel || next.assignedLevel || "A1";
  next.currentUnit = next.currentUnit || `${next.currentLevel}-U1`;
  next.diagnosticCompleted = typeof next.diagnosticCompleted === "boolean" ? next.diagnosticCompleted : true;
  next.academicProgress.completedUnits = Array.isArray(next.academicProgress.completedUnits)
    ? next.academicProgress.completedUnits
    : Array.isArray(next.completed) ? next.completed : [];
  next.academicProgress.validatedActivities = next.academicProgress.validatedActivities || {};
  return next;
}

async function api(path, options = {}) {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options
    });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, data };
  } catch (error) {
    return { ok: false, data: { message: "No se pudo conectar con el servidor." } };
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getLevel(code) {
  return window.PangolingoLevels[code];
}

function getUnit(levelCode, unitId) {
  return getLevel(levelCode)?.units.find((unit) => unit.id === unitId);
}

function getCurrentUnit() {
  return getUnit(selectedLevel, selectedUnitId) || getLevel(selectedLevel).units[0];
}

function levelPercent(levelCode) {
  const completed = savedProgress.academicProgress.completedUnits || [];
  const total = getLevel(levelCode)?.units.length || 10;
  return Math.round((completed.filter((id) => id.startsWith(`${levelCode}-`)).length / total) * 100);
}

function globalPercent() {
  return Math.round(((savedProgress.academicProgress.completedUnits || []).length / 60) * 100);
}

function renderStats() {
  document.getElementById("xpValue").textContent = savedProgress.xp || 0;
  document.getElementById("streakValue").textContent = savedProgress.streak || 0;
  document.getElementById("assignedLevelValue").textContent = savedProgress.assignedLevel || "Pendiente";
  document.getElementById("currentUnitValue").textContent = savedProgress.currentUnit || "A1-U1";
  document.getElementById("levelPercentValue").textContent = `${levelPercent(savedProgress.currentLevel)}%`;
  document.getElementById("globalPercentValue").textContent = `${globalPercent()}%`;
}

function renderLevelTabs() {
  document.getElementById("levelTabs").innerHTML = LEVEL_ORDER.map((level) => `
    <button type="button" class="level-tab ${level === selectedLevel ? "active" : ""}" data-level="${level}">
      ${level}<small>${levelPercent(level)}%</small>
    </button>
  `).join("");
}

function renderUnits() {
  const level = getLevel(selectedLevel);
  const completed = savedProgress.academicProgress.completedUnits || [];
  document.getElementById("levelTitle").textContent = `${level.level} - ${level.title}`;
  document.getElementById("levelDescription").textContent = level.description;
  document.getElementById("unitList").innerHTML = level.units.map((unit) => `
    <article class="unit-card ${unit.id === selectedUnitId ? "active" : ""}">
      <div>
        <span class="lesson-pill">${completed.includes(unit.id) ? "Completada" : "Disponible"}</span>
        <h3>${escapeHtml(unit.title)}</h3>
        <p>${escapeHtml(unit.intro)}</p>
      </div>
      <button type="button" class="btn btn-outline-light btn-sm" data-unit="${unit.id}">Abrir</button>
    </article>
  `).join("");
}

function renderActivity(activity, index) {
  if (activity.type === "true-false") {
    return `
      <article class="activity-card" data-activity="${index}">
        <p>${escapeHtml(activity.prompt)}</p>
        <button class="option-btn" data-answer="true">Verdadero</button>
        <button class="option-btn" data-answer="false">Falso</button>
        <small></small>
      </article>
    `;
  }
  if (activity.options) {
    return `
      <article class="activity-card" data-activity="${index}">
        <p>${escapeHtml(activity.prompt)}</p>
        ${activity.options.map((option) => `<button class="option-btn" data-answer="${escapeHtml(option)}">${escapeHtml(option)}</button>`).join("")}
        <small></small>
      </article>
    `;
  }
  return `
    <article class="activity-card" data-activity="${index}">
      <p>${escapeHtml(activity.prompt)} ${activity.items ? activity.items.join(" / ") : ""}</p>
      <input class="form-control" placeholder="Tu respuesta">
      <button class="btn btn-outline-light btn-sm mt-2" data-check-text>Revisar</button>
      <small></small>
    </article>
  `;
}

function renderReview() {
  const units = getLevel(selectedLevel).units;
  const vocabulary = units.flatMap((unit) => unit.vocabulary).slice(0, 24);
  return `
    <section class="review-box">
      <h3>Repaso general ${selectedLevel}</h3>
      <p>Conceptos principales: ${units.map((unit) => escapeHtml(unit.title)).join(", ")}.</p>
      <p>Vocabulario importante: ${vocabulary.map(escapeHtml).join(", ")}.</p>
      <p>Errores frecuentes: orden de palabras, conjugacion verbal, conectores y eleccion de registro.</p>
    </section>
  `;
}

function renderUnitDetail() {
  const unit = getCurrentUnit();
  selectedUnitId = unit.id;
  unitSession[unit.id] = unitSession[unit.id] || { viewed: true, correct: {} };
  document.getElementById("unitDetail").innerHTML = `
    <div class="panel-header">
      <p class="eyebrow">${escapeHtml(unit.id)}</p>
      <h2>${escapeHtml(unit.title)}</h2>
      <p>${escapeHtml(unit.intro)}</p>
    </div>
    <section class="learning-section"><h3>Explicacion teorica</h3><p>${escapeHtml(unit.theory)}</p></section>
    <section class="learning-section"><h3>Gramatica y expresiones utiles</h3><p>${escapeHtml(unit.grammar || "Practica estructuras del nivel en contexto real.")}</p><div class="word-list">${(unit.expressions || ["Can you repeat that?", "I think that...", "Could you help me?"]).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div></section>
    <section class="learning-section"><h3>Vocabulario clave</h3><div class="word-list">${unit.vocabulary.map((word) => `<span>${escapeHtml(word)}</span>`).join("")}</div></section>
    <section class="learning-section"><h3>Ejemplos</h3><ul>${unit.examples.map((example) => `<li>${escapeHtml(example)}</li>`).join("")}</ul></section>
    <section class="learning-section"><h3>Actividades practicas</h3>${unit.activities.map(renderActivity).join("")}</section>
    ${unit.cumulativeQuiz ? `<section class="learning-section"><h3>Quiz acumulativo</h3><p>Evalua unidades 1 a 5.</p><button class="btn btn-outline-light" data-run-assessment="quiz">Resolver quiz</button><p id="quizResult"></p></section>` : ""}
    ${unit.finalExam ? renderReview() + `<section class="learning-section"><h3>Examen ${selectedLevel}</h3><p>Evalua gramatica, vocabulario, lectura y uso contextual.</p><button class="btn btn-primary" data-run-assessment="exam">Presentar examen</button><p id="examResult"></p></section>` : ""}
    <section class="learning-section feedback-panel"><h3>Retroalimentacion</h3><p>${escapeHtml(unit.feedback)}</p><p id="unitValidationText">Valida todas las actividades para completar la unidad.</p><button type="button" class="btn btn-primary" id="completeUnitBtn">Completar unidad</button></section>
  `;
  refreshCompletionState();
  renderUnits();
}

function normalizeAnswer(value) {
  return String(value ?? "").trim().toLowerCase().replace(/[.?!]/g, "");
}

function checkActivity(card, rawAnswer) {
  const activity = getCurrentUnit().activities[Number(card.dataset.activity)];
  const expected = Array.isArray(activity.answer) ? activity.answer.join(" ") : activity.answer;
  const isCorrect = normalizeAnswer(rawAnswer) === normalizeAnswer(expected);
  const output = card.querySelector("small");
  output.textContent = isCorrect ? `Correcto. ${activity.explanation}` : `Respuesta correcta: ${expected}. ${activity.explanation}`;
  output.className = isCorrect ? "answer-ok" : "answer-review";
  if (isCorrect) {
    const unit = getCurrentUnit();
    unitSession[unit.id] = unitSession[unit.id] || { viewed: true, correct: {} };
    unitSession[unit.id].correct[card.dataset.activity] = true;
    savedProgress.academicProgress.validatedActivities[unit.id] = Object.keys(unitSession[unit.id].correct);
    refreshCompletionState();
  }
}

function getValidatedCount(unit) {
  const sessionCount = Object.keys((unitSession[unit.id] && unitSession[unit.id].correct) || {}).length;
  const storedCount = (savedProgress.academicProgress.validatedActivities[unit.id] || []).length;
  return Math.max(sessionCount, storedCount);
}

function canCompleteUnit(unit) {
  return Boolean(unitSession[unit.id]?.viewed) && getValidatedCount(unit) >= unit.activities.length;
}

function refreshCompletionState() {
  const unit = getCurrentUnit();
  const button = document.getElementById("completeUnitBtn");
  const text = document.getElementById("unitValidationText");
  if (!button || !text) return;
  const validated = getValidatedCount(unit);
  const ready = canCompleteUnit(unit);
  button.disabled = !ready;
  text.textContent = ready
    ? "Actividades validadas. Ya puedes completar la unidad."
    : `Progreso de validacion: ${validated}/${unit.activities.length} actividades correctas.`;
}

async function saveProgress() {
  savedProgress = normalizeProgress(savedProgress);
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(savedProgress));
  if (savedUser?.correo) {
    await api(`/progress/${encodeURIComponent(savedUser.correo)}`, {
      method: "PUT",
      body: JSON.stringify(savedProgress)
    });
  }
  renderStats();
  renderLevelTabs();
  renderUnits();
}

async function completeCurrentUnit() {
  const unit = getCurrentUnit();
  if (!canCompleteUnit(unit)) {
    Swal.fire({ title: "Unidad incompleta", text: "Primero revisa el contenido y responde correctamente todas las actividades.", icon: "warning" });
    return;
  }
  const alreadyCompleted = (savedProgress.academicProgress.completedUnits || []).includes(unit.id);
  savedProgress.academicProgress.completedUnits = Array.from(new Set([...(savedProgress.academicProgress.completedUnits || []), unit.id]));
  savedProgress.completed = savedProgress.academicProgress.completedUnits;
  if (!alreadyCompleted) {
    savedProgress.xp = (savedProgress.xp || 0) + (unit.progress?.xp || 20);
    savedProgress.streak = (savedProgress.streak || 0) + 1;
  }
  savedProgress.currentLevel = selectedLevel;
  savedProgress.currentUnit = unit.id;
  await saveProgress();
  Swal.fire({ title: "Unidad completada", text: `Ganaste ${unit.progress?.xp || 20} XP.`, icon: "success" });
}

async function runAssessment(type) {
  const key = type === "quiz" ? `${selectedLevel}-quiz-5` : `${selectedLevel}-exam`;
  const requiredUnits = type === "quiz"
    ? getLevel(selectedLevel).units.slice(0, 5)
    : getLevel(selectedLevel).units;
  const completed = savedProgress.academicProgress.completedUnits || [];
  const correct = requiredUnits.filter((unit) => completed.includes(unit.id)).length;
  const total = requiredUnits.length;
  const percent = Math.round((correct / total) * 100);
  const passed = percent >= 80;
  if (type === "exam") {
    const previousIndex = LEVEL_ORDER.indexOf(selectedLevel) - 1;
    if (previousIndex >= 0 && !(savedProgress.academicProgress.passedExams || []).includes(`${LEVEL_ORDER[previousIndex]}-exam`)) {
      Swal.fire({ title: "Nivel bloqueado", text: `Debes aprobar el examen ${LEVEL_ORDER[previousIndex]} antes de certificar ${selectedLevel}.`, icon: "info" });
      return;
    }
  }
  savedProgress.academicProgress.scores[key] = { score: correct, total, percent, passed };
  if (type === "quiz") {
    if (passed) savedProgress.academicProgress.completedQuizzes = Array.from(new Set([...(savedProgress.academicProgress.completedQuizzes || []), key]));
  } else if (passed) {
    savedProgress.academicProgress.passedExams = Array.from(new Set([...(savedProgress.academicProgress.passedExams || []), key]));
  }
  if (passed) savedProgress.xp = (savedProgress.xp || 0) + (type === "quiz" ? 35 : 60);
  await saveProgress();
  document.getElementById(type === "quiz" ? "quizResult" : "examResult").textContent =
    `Puntaje: ${correct}/${total}. Porcentaje: ${percent}%. Correctas: ${correct}. Incorrectas: ${total - correct}. Estado: ${passed ? "aprobado" : "reprobado"}. Recomendacion: ${passed ? "continua con el siguiente bloque" : "completa y valida las unidades pendientes"}.`;
}

function scorePlacement(form) {
  const data = new FormData(form);
  const score = ["vocabulary", "grammar", "reading", "listening", "expressions"].reduce((total, key) => total + Number(data.get(key) || 0), 0);
  if (score >= 14) return "C2";
  if (score >= 12) return "C1";
  if (score >= 10) return "B2";
  if (score >= 7) return "B1";
  if (score >= 4) return "A2";
  return "A1";
}

async function completePlacement(event) {
  event.preventDefault();
  const level = scorePlacement(event.currentTarget);
  savedProgress.assignedLevel = level;
  savedProgress.diagnosticCompleted = true;
  savedProgress.currentLevel = level;
  savedProgress.currentUnit = `${level}-U1`;
  selectedLevel = level;
  selectedUnitId = `${level}-U1`;
  await saveProgress();
  document.getElementById("placementPanel").classList.add("d-none");
  document.getElementById("learningPanel").classList.remove("d-none");
  renderAll();
  Swal.fire({ title: `Nivel asignado: ${level}`, text: "Tu ruta inicial quedo guardada en tu perfil.", icon: "success" });
}

function renderAll() {
  renderStats();
  renderLevelTabs();
  renderUnits();
  renderUnitDetail();
}

async function initLearning() {
  if (!savedUser) {
    window.location.href = "index.html";
    return;
  }
  document.getElementById("userName").textContent = savedUser.nombre || savedUser.correo;

  const progressResult = await api(`/progress/${encodeURIComponent(savedUser.correo)}`);
  if (progressResult.ok) {
    savedProgress = normalizeProgress(progressResult.data);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(savedProgress));
  }

  const mustTakeDiagnostic = savedProgress.diagnosticCompleted === false;
  document.getElementById("placementPanel").classList.toggle("d-none", !mustTakeDiagnostic);
  document.getElementById("learningPanel").classList.toggle("d-none", mustTakeDiagnostic);
  document.getElementById("placementForm").addEventListener("submit", completePlacement);
  document.getElementById("levelTabs").addEventListener("click", (event) => {
    const button = event.target.closest("[data-level]");
    if (!button) return;
    selectedLevel = button.dataset.level;
    selectedUnitId = `${selectedLevel}-U1`;
    renderAll();
  });
  document.getElementById("unitList").addEventListener("click", (event) => {
    const button = event.target.closest("[data-unit]");
    if (!button) return;
    selectedUnitId = button.dataset.unit;
    renderUnitDetail();
  });
  document.getElementById("unitDetail").addEventListener("click", (event) => {
    const answerButton = event.target.closest("[data-answer]");
    const textButton = event.target.closest("[data-check-text]");
    const completeButton = event.target.closest("#completeUnitBtn");
    const assessmentButton = event.target.closest("[data-run-assessment]");
    if (answerButton) checkActivity(answerButton.closest(".activity-card"), answerButton.dataset.answer);
    if (textButton) {
      const card = textButton.closest(".activity-card");
      checkActivity(card, card.querySelector("input").value);
    }
    if (completeButton) completeCurrentUnit();
    if (assessmentButton) runAssessment(assessmentButton.dataset.runAssessment);
  });
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PROGRESS_KEY);
    window.location.href = "index.html";
  });
  renderAll();
}

initLearning();
