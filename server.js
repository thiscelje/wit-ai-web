// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Wit.ai API endpoint
const WIT_AI_URL = 'https://api.wit.ai/message';
const WIT_AI_SERVER_TOKEN = '5KBEPBHH7N3GN5YR3SSXR47BAYQSTSKF';

// Route to handle voice commands
app.post('/wit-ai', async (req, res) => {
    const { query } = req.body;

    try {
        const response = await axios.get(WIT_AI_URL, {
            params: {
                v: '20250428',
                q: query,
            },
            headers: {
                Authorization: `Bearer ${WIT_AI_SERVER_TOKEN}`,
            },
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error calling Wit.ai API:', error.message);
        res.status(500).json({ error: 'Failed to process request' });
    }
});

// Serve static files
app.use(express.static('public'));

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Store all connected clients
const clients = new Set();

wss.on('connection', (ws) => {
    console.log('New client connected');
    clients.add(ws);

    // Handle incoming messages from client
    ws.on('message', (message) => {
        console.log(`Received message: ${message}`);
        broadcast(message); // Broadcast the message to all clients
    });

    // Handle client disconnection
    ws.on('close', () => {
        console.log('Client disconnected');
        clients.delete(ws);
    });
});

// Broadcast a message to all connected clients
function broadcast(message) {
    for (const client of clients) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    }
}

// Start server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});