# QA Test Plan: Navigation & UI Components

## Module: Navbar, Toast System, ProfileCard, EmptyState, Global UI
## Status: ✅ TESTED & VERIFIED

---

## Pre-requisites
- Dev server running on `http://localhost:3000`

---

## TEST SUITE 1: Navbar Component

### TC-1.1: Unauthenticated State
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Visit site logged out | Navbar shows: Logo + "Browse" + Login + Register |
| 2 | Logo click | Links to `/` (homepage) |
| 3 | Heart icon | Purple animated heart with "ShadiMatch" text |
| 4 | Login button | Links to `/login` |
| 5 | Register button | Links to `/register`, primary styled |

### TC-1.2: Authenticated State (Desktop)
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in | Navbar updates to full navigation |
| 2 | Desktop links | Dashboard, Search, Matches, Messages, Profile, Settings |
| 3 | Globe icon | Language switcher (cycles EN/HI/MR) |
| 4 | Bell icon | Notifications (with red pulse dot) |
| 5 | Crown button | Premium (gold button) |
| 6 | LogOut icon | Red hover logout button |
| 7 | Each link icon | LayoutDashboard, Search, Users, MessageCircle, User, Settings |

### TC-1.3: Mobile Menu
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Resize to mobile (<1024px) | Hamburger menu icon appears |
| 2 | Click hamburger | Mobile menu slides down |
| 3 | Check links | Dashboard, Search, My Matches, Messages, Kundali, Coach, Family, Events, Community, Vendors, Profile, Notifications, Settings, Premium, Logout |
| 4 | Click any link | Menu closes, navigates |
| 5 | Click X icon | Menu closes |
| 6 | Click Logout | Logs out, menu closes |

### TC-1.4: Scroll Behavior
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | At top of page | Navbar is transparent |
| 2 | Scroll down 20px+ | Navbar gets backdrop-blur, border, shadow |
| 3 | Scroll back to top | Navbar becomes transparent again |
| 4 | Transition is smooth | 500ms duration animation |

### TC-1.5: Language Switcher Integration
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click Globe icon once | EN → HI |
| 2 | Check badge text | "HI" shown below Globe |
| 3 | Click again | HI → MR |
| 4 | Click again | MR → EN |
| 5 | Cycles correctly | Always in order |

---

## TEST SUITE 2: Toast Notification System

### TC-2.1: Toast Display
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Trigger success action (save settings) | Green toast appears |
| 2 | Check position | Fixed position, visible on screen |
| 3 | Check auto-dismiss | Disappears after timeout |
| 4 | Check close button | X button to dismiss early |

### TC-2.2: Toast Types
| Type | Expected Style |
|------|---------------|
| Success | Green theme |
| Error | Red theme |
| Info | Purple/blue theme |

---

## TEST SUITE 3: ProfileCard Component

### TC-3.1: Card Rendering
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View in search results | Card shows avatar, name, age, city, education |
| 2 | Avatar | Gradient circle with initials |
| 3 | Verified badge | Blue BadgeCheck for verified profiles |
| 4 | Compatibility % | Percentage in corner |
| 5 | Hover effect | Card lifts/brightens (profile-hover class) |

### TC-3.2: Card Actions
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click card body | Navigates to `/profile/[id]` |
| 2 | Interest button | Sends interest (button state changes) |

---

## TEST SUITE 4: Responsive Design

### TC-4.1: Breakpoints
| Width | Expected Layout |
|-------|----------------|
| < 640px (Mobile) | Single column, full-width cards |
| 640-1024px (Tablet) | 2-column grid |
| > 1024px (Desktop) | 3-column grid, sidebar visible |

### TC-4.2: Critical Pages Responsive Check
| Page | Mobile | Tablet | Desktop |
|------|--------|--------|---------|
| Homepage | ✅ | ✅ | ✅ |
| Dashboard | ✅ | ✅ | ✅ |
| Search | ✅ | ✅ | ✅ |
| Messages | ✅ Split view | ✅ | ✅ |
| Profile | ✅ | ✅ | ✅ |
| Settings | ✅ | ✅ | ✅ |

---

## TEST SUITE 5: Global Background & Animations

### TC-5.1: Animated Background Orbs
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check page background | 3 blurred gradient orbs floating |
| 2 | Orbs animate | `animate-float-slow` and `animate-float` |
| 3 | z-index | Orbs behind all content (z-0, pointer-events-none) |
| 4 | No interaction | Can't click through orbs |

### TC-5.2: CSS Animations
| Animation | Used For |
|-----------|----------|
| `animate-fade-in-up` | Page sections appearing |
| `animate-heartbeat` | Heart icon pulsing |
| `animate-float` | Background orbs |
| `animate-pulse-glow` | Chatbot button |
| `animate-scale-in` | Chat window opening |

---

## TEST SUITE 6: Homepage (`/`)

### TC-6.1: Landing Page
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/` | Hero section with tagline |
| 2 | Check CTA | Register/Login buttons |
| 3 | Features section | Platform features highlighted |
| 4 | Success stories | Testimonials or stories |
| 5 | Stats | User count, match count indicators |

---

## Known Limitations
- No dark/light mode toggle (always dark theme)
- Mobile menu doesn't show language switcher (use settings page on mobile)
- Toast stacking: multiple toasts may overlap
- No keyboard navigation tested (accessibility gap)
