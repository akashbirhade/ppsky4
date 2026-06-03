# QA Test Plan: Regional Language Support

## Module: LanguageContext, Language Switcher (Navbar + Settings), Translations
## Status: ✅ TESTED & VERIFIED

---

## Pre-requisites
- Dev server running on `http://localhost:3000`
- Logged in as any user

---

## TEST SUITE 1: Language Context System

### TC-1.1: Default Language
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Clear localStorage, reload | Language defaults to 'en' (English) |
| 2 | Check UI text | All text in English |

### TC-1.2: Language Persistence
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Switch to Hindi | UI updates |
| 2 | Check localStorage | `shadiMatch_language` = 'hi' |
| 3 | Refresh page | Language stays Hindi |
| 4 | Switch to Marathi | localStorage updates to 'mr' |
| 5 | Refresh | Stays Marathi |

### TC-1.3: Translation Keys
| Key | English | Hindi | Marathi |
|-----|---------|-------|---------|
| `nav.dashboard` | Dashboard | डैशबोर्ड | डॅशबोर्ड |
| `nav.search` | Search | खोजें | शोधा |
| `nav.matches` | Matches | मैच | मॅच |
| `nav.messages` | Messages | संदेश | संदेश |
| `action.save` | Save | सेव करें | सेव्ह करा |
| `general.loading` | Loading... | लोड हो रहा है... | लोड होत आहे... |

### TC-1.4: Missing Key Fallback
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Call `t('nonexistent.key')` | Returns the key string itself: "nonexistent.key" |

---

## TEST SUITE 2: Navbar Language Switcher

### TC-2.1: Globe Button (Desktop)
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find Globe icon in Navbar (desktop view) | Globe icon with language code below (EN/HI/MR) |
| 2 | Click Globe button | Language cycles: EN → HI → MR → EN |
| 3 | First click | Shows "HI" badge, UI elements switch to Hindi |
| 4 | Second click | Shows "MR" badge, UI elements switch to Marathi |
| 5 | Third click | Shows "EN" badge, back to English |
| 6 | Check tooltip | "Switch Language" title attribute |

### TC-2.2: Language Indicator
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check language badge | Shows current language code in purple text |
| 2 | Position | Bottom-right of Globe icon, 9px text |

---

## TEST SUITE 3: Settings Page Language Section

### TC-3.1: Language Settings Card
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/settings` | "Language / भाषा" section with Globe icon |
| 2 | Check subtitle | "Choose your preferred language for the app interface" |
| 3 | Check language cards | 3 cards in grid: English, हिंदी, मराठी |

### TC-3.2: Language Selection
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Current language card | Has purple border + glow effect |
| 2 | Click "हिंदी" card | Card highlights, language switches |
| 3 | Check other cards | Deselected (subtle border) |
| 4 | Click "मराठी" | Marathi selected, card highlights |
| 5 | Click "English" | English selected |

### TC-3.3: Visual Feedback
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Selected card | Purple border, glow shadow, bg-purple-500/10 |
| 2 | Unselected card | Light border, transparent bg, subtle hover |
| 3 | Each card shows | Native name (large) + English name (small) |

---

## TEST SUITE 4: Translation Coverage

### TC-4.1: Navigation Translations
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Switch to Hindi | All navigation labels available in Hindi |
| 2 | Check Dashboard page welcome | "वापस स्वागत है" / "नमस्ते" |
| 3 | Switch to Marathi | "पुन्हा स्वागत" / "नमस्कार" |

### TC-4.2: Action Button Translations
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | `action.save` in Hindi | "सेव करें" |
| 2 | `action.cancel` in Marathi | "रद्द करा" |
| 3 | `action.submit` in Hindi | "जमा करें" |

### TC-4.3: Categories Covered (50+ keys)
- ✅ Navigation (8 keys)
- ✅ Dashboard (8 keys)
- ✅ Search (6 keys)
- ✅ Profile (6 keys)
- ✅ Actions (8 keys)
- ✅ General (4 keys)

---

## TEST SUITE 5: Integration Points

### TC-5.1: AI Chatbot Language Sync
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Set app language to Hindi (Globe button) | Chatbot placeholder may change |
| 2 | Type Hindi in chatbot | Chatbot responds in Hindi |
| 3 | Language detection is independent | Chatbot detects language per-message |

### TC-5.2: Provider Hierarchy
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check layout.tsx | `AuthProvider > LanguageProvider > ToastProvider > children` |
| 2 | `useLanguage()` inside any component | Works without error |
| 3 | `useLanguage()` outside LanguageProvider | Throws "must be used within LanguageProvider" |

---

## Known Limitations
- Not all UI strings are translated yet (Phase 3 pages use hardcoded English)
- 3 languages supported: English, Hindi, Marathi
- No RTL support (all LTR)
- Translation of dynamic content (user-generated) not supported
