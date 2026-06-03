# ShadiMatch - Master QA Test Plan

## Application: ShadiMatch - AI-Powered Matrimonial Platform
## Build: 38 Routes (All Passing ✅)
## Last Tested: May 2026

---

## Summary of Bugs Found & Fixed

| # | Bug | Severity | File | Fix |
|---|-----|----------|------|-----|
| 1 | Search page crash when user not logged in | HIGH | `src/app/search/page.tsx` | Added `if (user)` guard in useEffect |
| 2 | Dashboard null assertion crash | HIGH | `src/app/dashboard/page.tsx` | Replaced `user!.id` with null check `if (!user) return` |
| 3 | AI Chatbot quick actions didn't send message | MEDIUM | `src/components/AIChatBot.tsx` | Refactored `sendMessage(overrideText?)` to accept direct text |
| 4 | AI Chatbot send button type error | HIGH | `src/components/AIChatBot.tsx` | Wrapped in `() => sendMessage()` for onClick |
| 5 | Layout.tsx LanguageProvider indentation | LOW | `src/app/layout.tsx` | Fixed nesting/indentation |

---

## QA Test Files Index

| File | Module | Test Cases |
|------|--------|------------|
| [01-authentication.md](QA-TESTS/01-authentication.md) | Login, Register, Sessions | 15 test cases |
| [02-dashboard-profile.md](QA-TESTS/02-dashboard-profile.md) | Dashboard, Profile, Onboarding | 14 test cases |
| [03-search-matchmaking.md](QA-TESTS/03-search-matchmaking.md) | Search, Filters, ProfileCard | 16 test cases |
| [04-messaging.md](QA-TESTS/04-messaging.md) | Messages, Chat, Mobile responsive | 12 test cases |
| [05-ai-chatbot.md](QA-TESTS/05-ai-chatbot.md) | AI Bot, NLP, RAG, Multilingual | 20 test cases |
| [06-video-calling.md](QA-TESTS/06-video-calling.md) | Calls, Scheduling, Controls | 12 test cases |
| [07-kundali-matching.md](QA-TESTS/07-kundali-matching.md) | Kundali, Astrology API | 8 test cases |
| [08-family-account.md](QA-TESTS/08-family-account.md) | Family, Roles, Managed Profiles | 12 test cases |
| [09-language-support.md](QA-TESTS/09-language-support.md) | i18n, LanguageContext, Switcher | 14 test cases |
| [10-relationship-coach.md](QA-TESTS/10-relationship-coach.md) | Coach, Topics, Affirmations | 10 test cases |
| [11-wedding-vendors.md](QA-TESTS/11-wedding-vendors.md) | Vendors, Categories, Search | 10 test cases |
| [12-community-groups.md](QA-TESTS/12-community-groups.md) | Community, Join/Leave, Filters | 12 test cases |
| [13-event-matchmaking.md](QA-TESTS/13-event-matchmaking.md) | Events, Registration, Filters | 10 test cases |
| [14-settings-privacy.md](QA-TESTS/14-settings-privacy.md) | Settings, Privacy, Language UI | 12 test cases |
| [15-navigation-ui.md](QA-TESTS/15-navigation-ui.md) | Navbar, Toast, Responsive, Animations | 16 test cases |
| [16-premium-verification.md](QA-TESTS/16-premium-verification.md) | Premium, Verify, Plans | 8 test cases |
| [17-matches-activity.md](QA-TESTS/17-matches-activity.md) | Matches, Interests, Activity APIs | 10 test cases |

**Total: 201 test cases across 17 QA documents**

---

## How to Run QA Tests

### Setup
```bash
cd /Users/aakashbirhade/ppsky4
npm run dev
# Open http://localhost:3000
```

### Test Credentials
| Role | Email | Password |
|------|-------|----------|
| Female User (Priya) | priya@example.com | password123 |
| Any seed user | [any seed email] | password123 |
| New user | Register via `/register` | any 6+ chars |

### Test Order (Recommended)
1. Authentication (01) — establishes session
2. Dashboard & Profile (02) — core user experience
3. Search (03) — discover profiles
4. Messaging (04) — communication
5. AI Chatbot (05) — assistant functionality
6. Matches & Activity (17) — engagement features
7. Kundali (07) — unique feature
8. Video Calling (06) — connection feature
9. Settings (14) — privacy controls
10. Language (09) — i18n verification
11. Family (08), Coach (10), Vendors (11), Community (12), Events (13) — Phase 3&4 features
12. Premium & Verify (16) — monetization
13. Navigation & UI (15) — global UX

---

## Architecture & Routes

```
38 Routes:
├── Static Pages (○): /, login, register, dashboard, search, messages, 
│   matches, profile, settings, premium, verify, onboarding, 
│   success-stories, call, coach, community, events, family, 
│   kundali, notifications, vendors
├── Dynamic Pages (ƒ): /profile/[id]
└── API Routes (ƒ): /api/auth/login, /api/auth/register, /api/chat,
    /api/profiles, /api/profiles/update, /api/messages,
    /api/compatibility, /api/safety, /api/privacy,
    /api/activity/interests, /api/activity/kundali,
    /api/activity/matches, /api/activity/shortlist, /api/activity/views
```

---

## Performance Checklist

| Check | Status |
|-------|--------|
| Build passes (no errors) | ✅ |
| No TypeScript errors | ✅ |
| Largest page JS < 7KB | ✅ (max: 6.34KB settings) |
| Shared JS bundle | 87.3KB |
| All 38 routes generate | ✅ |
| No runtime crashes | ✅ |
| Mobile responsive | ✅ |
| Animations smooth | ✅ (CSS-based, hardware accelerated) |

---

## Security Checklist

| Check | Status |
|-------|--------|
| Passwords not exposed in API responses | ✅ |
| Input validation on all forms | ✅ |
| XSS prevention (React auto-escapes) | ✅ |
| CSRF (SameSite cookies) | ✅ (Next.js default) |
| Rate limiting | ⚠️ Not implemented (demo) |
| SQL Injection | N/A (in-memory, no SQL) |
| Auth tokens stored in localStorage | ⚠️ OK for demo, use httpOnly cookies in prod |
| Report/Block functionality | ✅ |
| Safe calling (number masking) | ✅ (UI-level) |
| Age verification (18+) | ✅ (Backend check) |
