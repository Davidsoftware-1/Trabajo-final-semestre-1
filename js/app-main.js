const STORAGE_KEY = "pangolingo-user";
const PROGRESS_KEY = "pangolingo-progress";

let savedUser = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
let savedProgress = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{\"xp\":40,\"streak\":4,\"completed\":[]}");
let selectedPeer = "";
let selectedReadingLevel = "A1";
let chatTimer = null;

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, data };
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function switchMode(mode) {
  document.querySelectorAll(".mode-section").forEach((section) => section.classList.remove("active"));
  document.getElementById(`${mode}Mode`)?.classList.add("active");
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.mode === mode));
}

async function translateWithApi(text, target, source) {
  const result = await api("/api/translate", {
    method: "POST",
    body: JSON.stringify({ text, target, source })
  });
  if (!result.ok || !result.data.ok) throw new Error(result.data.message || "Error en la traduccion.");
  return result.data.translated;
}

function initTranslator() {
  document.getElementById("searchBtn")?.addEventListener("click", async () => {
    const searchWord = document.getElementById("searchWord").value.trim().toLowerCase();
    const resultDiv = document.getElementById("searchResult");
    const notFoundDiv = document.getElementById("wordNotFound");
    const direction = document.querySelector("input[name='translationDirection']:checked")?.value || "enToEs";
    if (!searchWord) return;

    const dictToUse = direction === "enToEs" ? dictionary : reverseDictionary;
    if (dictToUse[searchWord]) {
      resultDiv.style.display = "block";
      resultDiv.innerHTML = `<strong>${escapeHtml(searchWord)}:</strong> ${escapeHtml(dictToUse[searchWord])}`;
      notFoundDiv.style.display = "none";
      return;
    }

    notFoundDiv.style.display = "block";
    notFoundDiv.textContent = `Buscando "${searchWord}" con LibreTranslate...`;
    try {
      const translatedText = await translateWithApi(searchWord, direction === "enToEs" ? "es" : "en", direction === "enToEs" ? "en" : "es");
      resultDiv.style.display = "block";
      resultDiv.innerHTML = `<strong>${escapeHtml(searchWord)}:</strong> ${escapeHtml(translatedText)}`;
      notFoundDiv.style.display = "none";
    } catch (error) {
      resultDiv.style.display = "none";
      notFoundDiv.textContent = `No se pudo traducir "${searchWord}".`;
    }
  });

  document.getElementById("searchWord")?.addEventListener("keypress", (event) => {
    if (event.key === "Enter") document.getElementById("searchBtn").click();
  });
}

async function refreshPresence() {
  if (!savedUser?.correo) return;
  await api("/api/presence", {
    method: "POST",
    body: JSON.stringify({ correo: savedUser.correo })
  }).catch(() => {});
}

function renderMessages(messages) {
  const box = document.getElementById("chatMessages");
  box.innerHTML = messages.map((message) => {
    const mine = message.from === savedUser.correo;
    const time = new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return `
      <div class="chat-bubble ${mine ? "mine" : ""}">
        <strong>${escapeHtml(message.fromName || message.from)}</strong>
        <span>${escapeHtml(message.text)}</span>
        <small>${time}</small>
      </div>
    `;
  }).join("");
  box.scrollTop = box.scrollHeight;
}

async function refreshChat() {
  if (!savedUser?.correo) return;
  await refreshPresence();
  const usersResult = await api("/api/chat/users").catch(() => ({ ok: false, data: { users: [] } }));
  if (usersResult.ok) {
    document.getElementById("chatUsers").innerHTML = usersResult.data.users
      .filter((user) => user.correo !== savedUser.correo)
      .map((user) => `
        <button class="chat-user ${selectedPeer === user.correo ? "active" : ""}" data-peer="${escapeHtml(user.correo)}">
          <span class="presence-dot ${user.online ? "online" : ""}"></span>
          ${escapeHtml(user.nombre || user.correo)}
        </button>
      `).join("");
  }

  const query = selectedPeer
    ? `/api/chat/messages?user=${encodeURIComponent(savedUser.correo)}&peer=${encodeURIComponent(selectedPeer)}`
    : "/api/chat/messages";
  const messagesResult = await api(query).catch(() => ({ ok: false, data: { messages: [] } }));
  if (messagesResult.ok) renderMessages(messagesResult.data.messages || []);
}

function initChat() {
  document.getElementById("chatUsers")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-peer]");
    if (!button) return;
    selectedPeer = button.dataset.peer;
    document.getElementById("globalChatBtn").classList.remove("active");
    refreshChat();
  });
  document.getElementById("globalChatBtn")?.addEventListener("click", () => {
    selectedPeer = "";
    document.getElementById("globalChatBtn").classList.add("active");
    refreshChat();
  });
  document.getElementById("sendChatBtn")?.addEventListener("click", async () => {
    const input = document.getElementById("chatInput");
    const text = input.value.trim();
    if (!text) return;
    await api("/api/chat/messages", {
      method: "POST",
      body: JSON.stringify({ from: savedUser.correo, to: selectedPeer || null, text })
    });
    input.value = "";
    refreshChat();
  });
  chatTimer = setInterval(refreshChat, 5000);
  refreshChat();
}

function renderLibrary() {
  document.getElementById("readingFilters").innerHTML = ["A1", "A2", "B1", "B2", "C1", "C2"].map((level) => `
    <button class="level-tab ${level === selectedReadingLevel ? "active" : ""}" data-reading-level="${level}">${level}</button>
  `).join("");
  document.getElementById("readingLibrary").innerHTML = window.PangolingoReadings
    .filter((reading) => reading.level === selectedReadingLevel)
    .map((reading) => `
      <article class="reading-card">
        <span class="lesson-pill">${reading.level} ${reading.difficulty}</span>
        <h3>${escapeHtml(reading.title)}</h3>
        <p>${escapeHtml(reading.text.slice(0, 120))}...</p>
        <button class="btn btn-outline-light btn-sm" data-reading="${reading.id}">Leer</button>
      </article>
    `).join("");
}

function openReading(id) {
  const reading = window.PangolingoReadings.find((entry) => entry.id === id);
  if (!reading) return;
  document.getElementById("readingDetail").innerHTML = `
    <article class="learning-section">
      <h3>${escapeHtml(reading.title)}</h3>
      <p>${escapeHtml(reading.text)}</p>
      <div class="word-list">${reading.vocabulary.map((word) => `<span>${escapeHtml(word)}</span>`).join("")}</div>
      <div class="mt-3">
        ${reading.questions.map((question, index) => `
          <div class="activity-card" data-reading-question="${index}">
            <p>${escapeHtml(question.prompt)}</p>
            ${question.options.map((option) => `<button class="option-btn" data-reading-answer="${escapeHtml(option)}">${escapeHtml(option)}</button>`).join("")}
            <small></small>
          </div>
        `).join("")}
      </div>
      <button class="btn btn-primary mt-3" data-score-reading="${reading.id}">Finalizar lectura</button>
    </article>
  `;
}

function initLibrary() {
  document.getElementById("readingFilters")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-reading-level]");
    if (!button) return;
    selectedReadingLevel = button.dataset.readingLevel;
    renderLibrary();
  });
  document.getElementById("readingLibrary")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-reading]");
    if (button) openReading(button.dataset.reading);
  });
  document.getElementById("readingDetail")?.addEventListener("click", async (event) => {
    const answer = event.target.closest("[data-reading-answer]");
    if (answer) {
      const card = answer.closest("[data-reading-question]");
      const reading = window.PangolingoReadings.find((entry) => document.querySelector("[data-score-reading]")?.dataset.scoreReading === entry.id);
      const question = reading.questions[Number(card.dataset.readingQuestion)];
      const ok = answer.dataset.readingAnswer === question.answer;
      card.dataset.correct = ok ? "true" : "false";
      card.querySelector("small").textContent = ok ? "Correcto." : `Respuesta correcta: ${question.answer}.`;
    }
    const finish = event.target.closest("[data-score-reading]");
    if (finish) {
      const reading = window.PangolingoReadings.find((entry) => entry.id === finish.dataset.scoreReading);
      const correct = [...document.querySelectorAll("[data-reading-question]")].filter((card) => card.dataset.correct === "true").length;
      const percent = Math.round((correct / reading.questions.length) * 100);
      if (percent >= 80) {
        savedProgress.xp = (savedProgress.xp || 0) + reading.xp;
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(savedProgress));
        if (savedUser?.correo) await api(`/api/progress/${encodeURIComponent(savedUser.correo)}`, { method: "PUT", body: JSON.stringify(savedProgress) });
      }
      Swal.fire({ title: `Lectura ${percent >= 80 ? "aprobada" : "por repasar"}`, text: `Puntaje: ${correct}/${reading.questions.length}. XP: ${percent >= 80 ? reading.xp : 0}`, icon: percent >= 80 ? "success" : "info" });
    }
  });
  renderLibrary();
}

function renderSpeaking(history) {
  const box = document.getElementById("speakingMessages");
  box.innerHTML = history.map((item) => `
    <div class="speak-row user">${escapeHtml(item.userText)}</div>
    <div class="speak-row bot">${escapeHtml(item.botText)}</div>
  `).join("");
  box.scrollTop = box.scrollHeight;
}

async function initSpeaking() {
  const historyResult = await api(`/api/speaking/${encodeURIComponent(savedUser.correo)}`).catch(() => ({ ok: false, data: { history: [] } }));
  if (historyResult.ok) renderSpeaking(historyResult.data.history || []);
  document.getElementById("sendSpeakingBtn")?.addEventListener("click", async () => {
    const input = document.getElementById("speakingInput");
    const text = input.value.trim();
    if (!text) return;
    document.getElementById("typingIndicator").classList.remove("d-none");
    const result = await api("/api/speaking", {
      method: "POST",
      body: JSON.stringify({ correo: savedUser.correo, text, level: savedProgress.assignedLevel || "A1" })
    });
    document.getElementById("typingIndicator").classList.add("d-none");
    if (result.ok) {
      input.value = "";
      const history = await api(`/api/speaking/${encodeURIComponent(savedUser.correo)}`);
      renderSpeaking(history.data.history || [result.data.reply]);
    }
  });
}

function initSettings() {
  document.getElementById("settingsName").value = savedUser.nombre || "";
  document.getElementById("settingsEmail").value = savedUser.correo || "";
  document.getElementById("resetDiagnosticBtn")?.addEventListener("click", async () => {
    savedProgress.diagnosticCompleted = false;
    savedProgress.assignedLevel = null;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(savedProgress));
    await api(`/api/progress/${encodeURIComponent(savedUser.correo)}`, { method: "PUT", body: JSON.stringify(savedProgress) });
    window.location.href = "inicio.html";
  });
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PROGRESS_KEY);
    if (chatTimer) clearInterval(chatTimer);
    window.location.href = "index.html";
  });
}

async function init() {
  if (!savedUser) {
    window.location.href = "index.html";
    return;
  }
  const progressResult = await api(`/api/progress/${encodeURIComponent(savedUser.correo)}`).catch(() => null);
  if (progressResult?.ok) {
    savedProgress = progressResult.data;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(savedProgress));
  }
  document.querySelectorAll(".nav-item").forEach((item) => item.addEventListener("click", () => switchMode(item.dataset.mode)));
  initTranslator();
  initChat();
  initLibrary();
  initSpeaking();
  initSettings();
}

init();
