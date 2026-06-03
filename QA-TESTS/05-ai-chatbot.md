# QA Test Plan: AI Chatbot Engine

## Module: AI Chatbot, NLP Processing, RAG Retrieval, Multilingual Support
## Status: ✅ TESTED & VERIFIED

---

## Pre-requisites
- Dev server running on `http://localhost:3000`
- Any page (chatbot is global floating widget)

---

## TEST SUITE 1: Chatbot Widget UI

### TC-1.1: Floating Button
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check bottom-right corner | Purple floating button with MessageCircle + Sparkles icons |
| 2 | Check animation | Pulse glow effect on button |
| 3 | Click button | Chat window opens (360-400px wide, 520px tall) |
| 4 | Check button state | Rotates 90°, shows X icon |
| 5 | Click X | Chat window closes |

### TC-1.2: Chat Window Structure
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open chatbot | Header: "AI Match Assistant" with Bot icon, green "Online" dot |
| 2 | Check welcome message | "Namaste! 🙏✨ I'm your AI Matchmaking Assistant..." |
| 3 | Check quick actions | 5 buttons: "Find matches", "Profile tips", "Kundali matching", "कुंडली मिलान", "मला मदत करा" |
| 4 | Check input field | Placeholder: "Ask in English, Hindi, or Marathi..." |
| 5 | Check send button | Purple circle with Send icon |

### TC-1.3: Quick Action Buttons
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Find matches" | Message sent automatically, response appears |
| 2 | Click "Profile tips" | Sends and gets AI response |
| 3 | Click "कुंडली मिलान" | Hindi query sent, response in Hindi |
| 4 | Click "मला मदत करा" | Marathi query sent, response in Marathi |
| 5 | Quick actions disappear | Hidden after first message exchange |

---

## TEST SUITE 2: Natural Language Processing

### TC-2.1: English Queries
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Type "How do I find matches?" | AI responds with match-finding tips in English |
| 2 | Type "Tell me about kundali" | AI responds about kundali matching |
| 3 | Type "Is my data safe?" | AI responds about privacy/security |
| 4 | Type "How to upgrade to premium?" | AI responds about premium features |

### TC-2.2: Hindi Queries (हिंदी)
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Type "मुझे मैच कैसे मिलेंगे?" | Response in Hindi |
| 2 | Type "प्रोफाइल कैसे बनाएं?" | Hindi profile tips response |
| 3 | Check header language indicator | Shows "हिंदी" |
| 4 | Check input placeholder | Changes to "कुछ भी पूछें..." |

### TC-2.3: Marathi Queries (मराठी)
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Type "मला मदत हवी आहे" | Response in Marathi |
| 2 | Type "माझं प्रोफाइल कसं सुधारू?" | Marathi profile guidance |
| 3 | Check header language indicator | Shows "मराठी" |
| 4 | Check input placeholder | Changes to "काहीही विचारा..." |

### TC-2.4: Intent Classification
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | "how to improve my profile" | Intent: profile_tips — gives profile improvement advice |
| 2 | "I want to find a match" | Intent: find_matches — suggests using search/AI features |
| 3 | "tell me about kundali matching" | Intent: kundali — explains kundali system |
| 4 | "I feel unsafe" | Intent: safety — provides safety guidance |
| 5 | "what are premium features" | Intent: premium_info — lists premium benefits |
| 6 | "hello" | Intent: greeting — friendly greeting response |

---

## TEST SUITE 3: Conversation Flow

### TC-3.1: Multi-Turn Conversation
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send "Hello" | Gets greeting response |
| 2 | Send "How do I search?" | Gets search-related response |
| 3 | Send "Thank you" | Gets polite closing response |
| 4 | Check conversation history | All messages displayed in order |

### TC-3.2: Typing Indicator
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send a message | Three bouncing dots appear (typing animation) |
| 2 | Wait 0.8-1.8 seconds | Response appears, dots disappear |

### TC-3.3: Auto-Scroll
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send 10+ messages | Chat auto-scrolls to latest |
| 2 | Scroll up manually | Can read old messages |
| 3 | Send new message | Scrolls back to bottom |

### TC-3.4: Error Handling
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Disconnect network, send message | Fallback: "Let me try again in a moment! 💫" |
| 2 | Reconnect and send | Normal response resumes |

---

## TEST SUITE 4: API Endpoint (`/api/chat`)

### TC-4.1: Valid Request
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "How to find matches?", "sessionId": "test123"}'
```
| Expected | `{ response: "...", language: "en", intent: "find_matches", confidence: > 0 }` |

### TC-4.2: Hindi Request
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "मुझे मैच कैसे मिलेंगे?", "sessionId": "test456"}'
```
| Expected | `{ response: "...", language: "hi", intent: "find_matches" }` |

### TC-4.3: Empty Message
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": ""}'
```
| Expected | `{ error: "Message is required" }` with status 400 |

---

## TEST SUITE 5: AI Engine Architecture

### TC-5.1: NLP Pipeline Verification
| Component | Input | Expected Output |
|-----------|-------|-----------------|
| Language Detection | "How are you" | 'en' |
| Language Detection | "आप कैसे हैं" | 'hi' |
| Language Detection | "तुम्ही कसे आहात" | 'mr' |
| Tokenization | "find good matches" | ['find', 'good', 'matches'] |
| Entity Extraction | "looking for Hindu bride in Mumbai" | {religion: 'Hindu', city: 'Mumbai'} |
| Sentiment Analysis | "I love this!" | 'positive' |
| Sentiment Analysis | "very bad experience" | 'negative' |

### TC-5.2: RAG Retrieval
| Query | Expected Top Document |
|-------|---------------------|
| "profile tips" | Profile optimization guide |
| "kundali matching" | Kundali/astrology document |
| "safety" | Safety & privacy document |
| "premium benefits" | Premium features document |

---

## Bugs Fixed During QA
1. **Quick actions didn't send**: Clicking quick action buttons only set the input text but didn't send — fixed by calling `sendMessage(text)` directly with overrideText parameter
2. **Send button type mismatch**: `onClick={sendMessage}` passed MouseEvent as string parameter — fixed by wrapping in `() => sendMessage()`

---

## Known Limitations
- AI responses are rule-based (not LLM-powered) — responses come from knowledge base templates
- Session memory clears on server restart (in-memory Map)
- No conversation persistence across page reloads (client-side state only)
- Maximum 10 messages in context window for response generation
