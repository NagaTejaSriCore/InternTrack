const express = require('express');
const router = express.Router();
const { generateFollowUpMessage } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// Protected route to generate AI follow-up messages
router.post('/followup', protect, generateFollowUpMessage);

module.exports = router;
