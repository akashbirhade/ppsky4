# QA Test Plan: AI Relationship Coach

## Module: Coach Page, Topic Expansion, Daily Affirmations
## Status: ✅ TESTED & VERIFIED

---

## Pre-requisites
- Logged in as any user
- Dev server running on `http://localhost:3000`

---

## TEST SUITE 1: Coach Page (`/coach`)

### TC-1.1: Page Load
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/coach` | Page loads with "AI-Powered Guidance" badge |
| 2 | Check heading | Brain icon with coaching-related heading |
| 3 | Check auth guard | Redirects to `/login` if not logged in |
| 4 | Check initial state | First topic "First Impressions" expanded by default |

### TC-1.2: Topic Cards (6 Topics)
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Count topic cards | 6 topics displayed |
| 2 | Topic 1: "First Impressions" | ✨ icon, "Make your profile stand out" |
| 3 | Topic 2: "Starting Conversations" | 💬 icon, "Break the ice confidently" |
| 4 | Topic 3: "First Meeting Tips" | ☕ icon, "Make it memorable & safe" |
| 5 | Topic 4: "Family Dynamics" | 👨‍👩‍👧‍👦 icon, "Navigate family expectations" |
| 6 | Topic 5: "Building Compatibility" | 💕 icon, "Deepen your connection" |
| 7 | Topic 6: "Safety & Red Flags" | 🛡️ icon, "Stay safe while dating" |

---

## TEST SUITE 2: Topic Expansion/Collapse

### TC-2.1: Expand Topic
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Starting Conversations" header | Tips expand below with animation |
| 2 | Check tips count | 5 tips shown for this topic |
| 3 | Previous topic collapses | "First Impressions" tips hide |
| 4 | Only one topic open at a time | Accordion behavior |

### TC-2.2: Collapse Topic
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click same expanded topic header | Topic collapses (all closed) |
| 2 | Check chevron icon | ChevronDown when collapsed, ChevronUp when expanded |

### TC-2.3: Verify Each Topic's Tips
| Topic | Expected Tips Count |
|-------|-------------------|
| First Impressions | 5 tips |
| Starting Conversations | 5 tips |
| First Meeting Tips | 6 tips |
| Family Dynamics | 6 tips |
| Building Compatibility | ≥5 tips |
| Safety & Red Flags | ≥5 tips |

---

## TEST SUITE 3: Daily Affirmation

### TC-3.1: Affirmation Display
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check affirmation section | Shows a daily motivational quote |
| 2 | Quote is randomized | Different quote on each page mount |
| 3 | Styled distinctively | Special card styling with Sparkles icon |

### TC-3.2: Affirmation Consistency
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Note the affirmation | Random from predefined list |
| 2 | Refresh page | May show different affirmation (random selection) |

---

## TEST SUITE 4: Quick Stats Section

### TC-4.1: Stats Display
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check stats area | Shows engagement metrics |
| 2 | Stats are decorative | Hardcoded values for UI |

---

## TEST SUITE 5: Content Quality

### TC-5.1: Tip Content Verification
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Read "First Impressions" tips | Actionable profile advice (clear, well-lit photos, specific interests) |
| 2 | Read "Safety" tips | Relevant safety guidance (meet public, tell friend) |
| 3 | Check for typos | No typos in tip text |
| 4 | Check tone | Supportive, professional, non-judgmental |

### TC-5.2: Indian Context
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | "Family Dynamics" tips | Culturally relevant (family expectations, traditions) |
| 2 | Content appropriate | Respects arranged marriage traditions while being progressive |

---

## Known Limitations
- Tips are static (not AI-generated per user)
- No personalization based on user profile
- No progress tracking ("did this tip help?")
- Affirmation is client-side random (not daily-fixed)
