# QA Test Plan: Messaging System

## Module: Messages Page, Conversations, Real-time Chat
## Status: ✅ TESTED & VERIFIED

---

## Pre-requisites
- Logged in as `priya@example.com / password123`
- Dev server running on `http://localhost:3000`

---

## TEST SUITE 1: Messages Page (`/messages`)

### TC-1.1: Page Load - Conversation List
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/messages` | Split view: sidebar + chat area |
| 2 | Check conversation list | 5 conversations with names, avatars, last message |
| 3 | Check unread badges | Purple badge with count on Priya Sharma (2) and Meera Patel (1) |
| 4 | Check online indicators | Green dot on Priya Sharma and Ananya Desai |
| 5 | Check timestamps | "2m ago", "15m ago", "1h ago", etc. |

### TC-1.2: Search Conversations
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Type "Priya" in search box | Only Priya Sharma conversation shown |
| 2 | Type "xyz" | No conversations shown (empty list) |
| 3 | Clear search | All conversations return |

### TC-1.3: Select Conversation
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click on "Priya Sharma" conversation | Chat area shows messages |
| 2 | Check header | Name, online status, phone/video/more buttons |
| 3 | Check messages | 6 mock messages displayed |
| 4 | Check message styling | Sent = purple gradient (right), Received = glass (left) |
| 5 | Check timestamps | "10:30 AM", "10:32 AM" etc. on each message |
| 6 | Check auto-scroll | Scrolled to bottom (latest message visible) |

### TC-1.4: Send Message
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Type "Hello!" in input | Text appears in input field |
| 2 | Click Send button (or press Enter) | Message appears on right side (purple) |
| 3 | Check timestamp | Current time shown |
| 4 | Wait 2 seconds | Auto-reply appears: "That's great! I'd love to know more..." |
| 5 | Auto-scroll | Scrolls to show new messages |

### TC-1.5: Empty Message Prevention
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Leave input empty, click Send | Nothing happens (prevented) |
| 2 | Type spaces only, click Send | Nothing happens (trim check) |

### TC-1.6: Mobile Responsive View
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Resize to mobile width (<640px) | Only conversation list visible |
| 2 | Click a conversation | Chat area takes full width |
| 3 | Click back arrow | Returns to conversation list |

### TC-1.7: Auth Guard
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Logout, navigate to `/messages` | Redirects to `/login` |

---

## TEST SUITE 2: Chat Header Actions

### TC-2.1: Action Buttons
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click Phone icon | Simulated action (no crash) |
| 2 | Click Video icon | Simulated action (no crash) |
| 3 | Click MoreVertical icon | Simulated action (no crash) |

### TC-2.2: Empty State
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open messages with no chat selected (desktop) | "Your Messages - Select a conversation" shown |
| 2 | Check icon | MessageCircle icon displayed in center |

---

## TEST SUITE 3: Performance

### TC-3.1: Message Rendering
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Send 20+ messages rapidly | All render without lag |
| 2 | Check scroll performance | Smooth scrolling through messages |
| 3 | Check auto-scroll | Always scrolls to latest message |

---

## Known Limitations
- Messages are mock data (not persisted to database)
- Auto-reply is hardcoded (same response every time)
- No file/image upload functionality (buttons are UI only)
- No emoji picker (button is UI only)
- Phone/Video buttons in header are decorative (use `/call` page instead)
