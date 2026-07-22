"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("@middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// Simple AI response engine (inline to avoid cross-package imports)
function generateAIResponse(message, _sessionId, _userName) {
    const lower = message.toLowerCase();
    let reply = '';
    let intent = 'general';
    if (lower.includes('match') || lower.includes('compatible')) {
        intent = 'matching';
        reply = 'Based on your preferences, I suggest looking for profiles that share your values and interests. Would you like me to refine your search criteria?';
    }
    else if (lower.includes('profile') || lower.includes('bio')) {
        intent = 'profile_help';
        reply = 'A great profile includes clear photos, an honest bio, and details about your interests. Would you like tips on improving your profile?';
    }
    else if (lower.includes('message') || lower.includes('talk') || lower.includes('chat')) {
        intent = 'conversation';
        reply = 'Start with something personal from their profile. Ask open-ended questions and be genuine. Would you like message templates?';
    }
    else if (lower.includes('kundali') || lower.includes('horoscope')) {
        intent = 'kundali';
        reply = 'Kundali matching checks compatibility across 8 aspects (Ashtakoota). A score above 18/36 is considered good. Would you like to check compatibility with someone?';
    }
    else if (lower.includes('safety') || lower.includes('report') || lower.includes('block')) {
        intent = 'safety';
        reply = 'Your safety is our priority. You can block or report any profile. Never share personal details like address or financial info early on.';
    }
    else {
        reply = 'I\'m your relationship coach! I can help with profile tips, conversation starters, matching advice, and safety guidance. What would you like help with?';
    }
    return { message: reply, intent, confidence: 0.85, language: 'en', sentiment: 'neutral' };
}
router.post('/message', (req, res) => {
    try {
        const { message } = req.body;
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ success: false, message: 'message is required' });
        }
        const sessionId = req.user.userId;
        const userName = req.user?.firstName || undefined;
        const response = generateAIResponse(message.trim(), sessionId, userName);
        res.json({
            success: true,
            data: {
                reply: response.message,
                intent: response.intent,
                confidence: response.confidence,
                language: response.language,
                sentiment: response.sentiment,
            },
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'AI processing failed' });
    }
});
exports.default = router;
//# sourceMappingURL=ai.routes.js.map