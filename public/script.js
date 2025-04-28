const startBtn = document.getElementById('start-btn');
const outputDiv = document.getElementById('output');
const lampu = document.getElementById('lampu');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');

let recognition;
let currentCommand = ''; // Store the current command for use in handleWitResponse

// Initialize speech recognition if available
function initializeSpeechRecognition() {
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'id-ID'; // Indonesian language

        recognition.onresult = async (event) => {
            currentCommand = event.results[0][0].transcript.toLowerCase();
            outputDiv.textContent = `Perintah: ${currentCommand}`;
            await processCommand(currentCommand);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            outputDiv.textContent = 'Error dalam pengenalan suara.';
        };

        recognition.onend = () => {
            // Auto-restart or change UI state if needed
        };
    } else {
        startBtn.style.display = 'none';
        console.warn('Speech recognition not supported in this browser.');
    }
}

// Process command (shared between voice and text input)
async function processCommand(command) {
    if (!command) {
        alert('Silakan masukkan perintah.');
        return;
    }

    try {
        const response = await fetch('/wit-ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: command }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        handleWitResponse(data, command);
    } catch (error) {
        console.error('Error processing command:', error);
        outputDiv.textContent = 'Terjadi kesalahan saat memproses perintah.';
    }
}

// Handle Send Button Click
sendBtn.addEventListener('click', async () => {
    currentCommand = chatInput.value.trim().toLowerCase();
    await processCommand(currentCommand);
    chatInput.value = '';
});

// Handle Enter Key Press in Chat Input
chatInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendBtn.click();
    }
});

// Start listening
startBtn.addEventListener('click', () => {
    if (recognition) {
        recognition.start();
        outputDiv.textContent = 'Mendengarkan...';
    }
});

// Handle Wit.ai response
function handleWitResponse(data, command) {
    if (!data || !data.intents || data.intents.length === 0) {
        outputDiv.textContent = 'Perintah tidak dikenali.';
        return;
    }

    const intent = data.intents[0]?.name;
    const device = data.entities['device:device']?.[0]?.value;

    if (intent === 'set_device') {
        if (command.includes('nyalakan')) {
            lampu.classList.remove('off');
            lampu.classList.add('on');
            outputDiv.textContent = 'Lampu dinyalakan.';
        } else if (command.includes('matikan')) {
            lampu.classList.remove('on');
            lampu.classList.add('off');
            outputDiv.textContent = 'Lampu dimatikan.';
        }
    } else if (intent === 'get_device') {
        const status = lampu.classList.contains('on') ? 'Nyala' : 'Mati';
        outputDiv.textContent = `Status Lampu: ${status}`;
    } else {
        outputDiv.textContent = 'Perintah tidak dikenali.';
    }
}

// Initialize the app
initializeSpeechRecognition();