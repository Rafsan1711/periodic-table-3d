/**
 * ============================================
 * CHEMAI BACKEND SERVER
 * Express.js server with Hugging Face integration
 * ============================================
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const chatRoutes = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api', chatRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'ChemAI Backend is running',
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'ChemAI Backend API',
        version: '1.0.0',
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
app.listen(PORT, () => {
    console.log('');
    console.log('🚀 ============================================');
    console.log('   ChemAI Backend Server Started');
    console.log('   ============================================');
    console.log(`   📡 Server running on: http://localhost:${PORT}`);
    console.log(`   🔑 HF Token: ${process.env.HF_TOKEN ? '✅ Configured' : '❌ Missing'}`);
    console.log(`   🌐 CORS Origin: ${process.env.FRONTEND_URL || 'All origins'}`);
    console.log('   ============================================');
    console.log('');
});
