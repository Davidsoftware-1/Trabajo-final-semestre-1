// Speaking challenges data
const speakingChallenges = {
    greetings: {
        title: "Saludos",
        level: "A1",
        prompts: [
            "Say: Hello, how are you?",
            "Say: Good morning, nice to meet you",
            "Say: Goodbye, see you later",
            "Say: Thank you very much",
            "Say: You're welcome"
        ],
        tips: "Focus on clear pronunciation of each word. Speak slowly and distinctly."
    },
    ordering: {
        title: "En el restaurante",
        level: "A2",
        prompts: [
            "Say: I would like to order a coffee, please",
            "Say: Can I have the menu, please?",
            "Say: I'd like to pay the bill",
            "Say: The food was delicious, thank you",
            "Say: Could I have some water, please?"
        ],
        tips: "Practice polite phrases. Use rising intonation for questions."
    },
    directions: {
        title: "Direcciones",
        level: "B1",
        prompts: [
            "Say: Excuse me, could you tell me where the station is?",
            "Say: Go straight ahead and turn left at the corner",
            "Say: Is it far from here?",
            "Say: Thank you for your help",
            "Say: I'm looking for the main square"
        ],
        tips: "Use clear directional vocabulary. Speak at a natural pace."
    },
    interview: {
        title: "Entrevista",
        level: "B2",
        prompts: [
            "Say: I have experience in customer service",
            "Say: I'm a quick learner and adaptable",
            "Say: I believe I'm a good fit for this position",
            "Say: I'm looking for new challenges",
            "Say: Thank you for considering my application"
        ],
        tips: "Speak confidently and professionally. Maintain good rhythm."
    }
};

// Recording state
let mediaRecorder = null;
let audioChunks = [];
let currentRecording = null;
let recordingTimer = null;
let recordingSeconds = 0;
let currentChallenge = null;
let recordings = [];

// Initialize speaking functionality
function initSpeaking() {
    // Challenge selection
    document.querySelectorAll('.speaking-challenge').forEach(challenge => {
        challenge.addEventListener('click', () => {
            const challengeId = challenge.dataset.challenge;
            selectChallenge(challengeId);
        });
    });

    // Recording controls
    document.getElementById('startRecordingBtn')?.addEventListener('click', startRecording);
    document.getElementById('stopRecordingBtn')?.addEventListener('click', stopRecording);
    document.getElementById('playRecordingBtn')?.addEventListener('click', playRecording);
    document.getElementById('submitRecordingBtn')?.addEventListener('click', submitRecording);
}

function selectChallenge(challengeId) {
    currentChallenge = speakingChallenges[challengeId];
    
    // Update UI
    document.querySelectorAll('.speaking-challenge').forEach(c => {
        c.classList.remove('active');
        if (c.dataset.challenge === challengeId) {
            c.classList.add('active');
        }
    });

    document.getElementById('currentChallengeTitle').textContent = currentChallenge.title;
    
    // Show random prompt
    const randomPrompt = currentChallenge.prompts[Math.floor(Math.random() * currentChallenge.prompts.length)];
    document.getElementById('currentChallengePrompt').textContent = randomPrompt + " - " + currentChallenge.tips;
    
    // Reset recording state
    resetRecordingUI();
}

async function startRecording() {
    if (!currentChallenge) {
        Swal.fire('Selecciona un reto', 'Por favor selecciona un reto de pronunciación primero', 'warning');
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            currentRecording = audioBlob;
            
            // Show play and submit buttons
            document.getElementById('playRecordingBtn').classList.remove('d-none');
            document.getElementById('submitRecordingBtn').classList.remove('d-none');
        };

        mediaRecorder.start();
        
        // Update UI
        document.getElementById('startRecordingBtn').classList.add('d-none');
        document.getElementById('stopRecordingBtn').classList.remove('d-none');
        document.getElementById('recordingProgress').classList.remove('d-none');
        
        // Start timer
        recordingSeconds = 0;
        updateRecordingTime();
        recordingTimer = setInterval(updateRecordingTime, 1000);
        
        // Animate progress bar
        animateProgressBar();

    } catch (error) {
        console.error('Error accessing microphone:', error);
        Swal.fire('Error', 'No se pudo acceder al micrófono. Por favor permite el acceso.', 'error');
    }
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        
        // Stop timer
        clearInterval(recordingTimer);
        
        // Update UI
        document.getElementById('startRecordingBtn').classList.remove('d-none');
        document.getElementById('stopRecordingBtn').classList.add('d-none');
        document.getElementById('recordingProgress').classList.add('d-none');
    }
}

function playRecording() {
    if (currentRecording) {
        const audioUrl = URL.createObjectURL(currentRecording);
        const audio = new Audio(audioUrl);
        audio.play();
    }
}

function submitRecording() {
    if (!currentRecording) {
        Swal.fire('Error', 'No hay grabación para enviar', 'error');
        return;
    }

    // Analyze recording (simulated)
    analyzeRecording();
}

function analyzeRecording() {
    // Simulated analysis - in a real app, this would use speech recognition
    const pronunciationScore = Math.floor(Math.random() * 30) + 70; // 70-100
    const fluencyScore = Math.floor(Math.random() * 30) + 65; // 65-95
    const volumeScore = Math.floor(Math.random() * 20) + 80; // 80-100

    // Update feedback UI
    document.getElementById('pronunciationScore').textContent = pronunciationScore + '%';
    document.getElementById('fluencyScore').textContent = fluencyScore + '%';
    document.getElementById('volumeScore').textContent = volumeScore + '%';

    // Generate suggestions
    let suggestions = [];
    if (pronunciationScore < 80) {
        suggestions.push("Practica la pronunciación de cada palabra individualmente");
    }
    if (fluencyScore < 80) {
        suggestions.push("Intenta hablar con más fluidez y naturalidad");
    }
    if (volumeScore < 85) {
        suggestions.push("Habla un poco más fuerte y con más claridad");
    }
    if (suggestions.length === 0) {
        suggestions.push("¡Excelente trabajo! Sigue practicando así.");
    }

    document.getElementById('feedbackSuggestions').textContent = suggestions.join('. ');
    document.getElementById('feedbackArea').classList.remove('d-none');

    // Save recording to history
    saveRecording(pronunciationScore, fluencyScore, volumeScore);

    // Show success message
    Swal.fire({
        title: '¡Grabación enviada!',
        text: 'Tu pronunciación ha sido analizada',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
    });
}

function saveRecording(pronunciation, fluency, volume) {
    const recording = {
        id: Date.now(),
        challenge: currentChallenge.title,
        date: new Date().toLocaleString(),
        duration: recordingSeconds,
        scores: { pronunciation, fluency, volume }
    };

    recordings.unshift(recording);
    updateRecordingsList();
}

function updateRecordingsList() {
    const recordingsList = document.getElementById('recordingsList');
    
    if (recordings.length === 0) {
        recordingsList.innerHTML = '<p class="text-muted small">No hay grabaciones aún</p>';
        return;
    }

    recordingsList.innerHTML = recordings.map(rec => `
        <div class="recording-item">
            <div class="recording-item-info">
                <h6>${rec.challenge}</h6>
                <p>${rec.date} - Duración: ${rec.duration}s</p>
                <p class="small">
                    Pronunciación: ${rec.scores.pronunciation}% | 
                    Fluidez: ${rec.scores.fluency}% | 
                    Volumen: ${rec.scores.volume}%
                </p>
            </div>
            <div class="recording-item-actions">
                <button class="btn btn-sm btn-secondary" onclick="playRecordingById(${rec.id})">
                    <i class="fas fa-play"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteRecording(${rec.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function playRecordingById(id) {
    const recording = recordings.find(r => r.id === id);
    if (recording && recording.audioBlob) {
        const audioUrl = URL.createObjectURL(recording.audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
    }
}

function deleteRecording(id) {
    recordings = recordings.filter(r => r.id !== id);
    updateRecordingsList();
}

function resetRecordingUI() {
    currentRecording = null;
    audioChunks = [];
    recordingSeconds = 0;
    
    document.getElementById('startRecordingBtn').classList.remove('d-none');
    document.getElementById('stopRecordingBtn').classList.add('d-none');
    document.getElementById('playRecordingBtn').classList.add('d-none');
    document.getElementById('submitRecordingBtn').classList.add('d-none');
    document.getElementById('recordingProgress').classList.add('d-none');
    document.getElementById('feedbackArea').classList.add('d-none');
    document.getElementById('recordingTime').textContent = 'Tiempo: 0:00';
}

function updateRecordingTime() {
    const minutes = Math.floor(recordingSeconds / 60);
    const seconds = recordingSeconds % 60;
    document.getElementById('recordingTime').textContent = 
        `Tiempo: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    recordingSeconds++;
}

function animateProgressBar() {
    const progressBar = document.querySelector('#recordingProgress .progress-bar');
    let width = 0;
    const interval = setInterval(() => {
        if (width >= 100) {
            clearInterval(interval);
        } else {
            width += 1;
            progressBar.style.width = width + '%';
        }
    }, 100);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSpeaking);
} else {
    initSpeaking();
}
