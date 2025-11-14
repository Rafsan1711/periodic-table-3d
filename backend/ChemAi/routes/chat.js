/**
 * ============================================
 * CHAT ROUTES
 * API endpoints for chat functionality
 * ============================================
 */

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

/**
 * POST /api/chat
 * Send message to AI
 */
router.post('/chat', async (req, res) => {
    try {
        const { message, model, history } = req.body;

        // Validate input
        if (!message || typeof message !== 'string') {
            return res.status(400).json({
                error: 'Invalid request',
                message: 'Message is required and must be a string'
            });
        }

        // Check chemistry validation
        if (!aiController.isChemistryRelated(message)) {
            return res.json({
                response: "I'm ChemAI, your chemistry assistant. I can only answer questions related to chemistry. Please ask me about elements, molecules, reactions, or other chemistry topics!",
                model: model || 'vicuna',
                timestamp: Date.now()
            });
        }

        // Get AI response
        const response = await aiController.getAIResponse(
            message,
            model || 'vicuna',
            history || []
        );

        res.json(response);

    } catch (error) {
        console.error('❌ Chat endpoint error:', error);
        res.status(500).json({
            error: 'Failed to process request',
            message: error.message
        });
    }
});

module.exports = router;
