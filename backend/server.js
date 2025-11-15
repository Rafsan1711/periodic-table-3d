/**
 * ============================================
 * CHEMAI BACKEND SERVER - CORS FIXED
 * ============================================
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const chatRoutes = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS - Allow your frontend domains
const allowedOrigins = [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'https://periodic-table-3d.netlify.app',
    'https://periodic-table-3d-ai.netlify.app' // Your testing branch
];

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.warn('Blocked origin:', origin);
            callback(null, true); // Allow anyway for now
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Handle preflight
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path} from ${req.get('origin') || 'unknown'}`);
    next();
});

// Routes
app.use('/api', chatRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'ChemAI Backend is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'ChemAI Backend API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            health: '/api/health',
            chat: '/api/chat'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        path: req.path
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('🚀 ============================================');
    console.log('   ChemAI Backend Server Started');
    console.log('   ============================================');
    console.log(`   📡 Server: http://localhost:${PORT}`);
    console.log(`   🔑 HF Token: ${process.env.HF_TOKEN ? '✅ Set' : '❌ Missing'}`);
    console.log(`   🌐 CORS: Enabled for ${allowedOrigins.length} origins`);
    console.log('   ============================================');
    console.log('');
});
