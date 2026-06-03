# QA Test Plan: Dashboard & Profile Management

## Module: Dashboard, Profile View, Profile Edit, Onboarding
## Status: ✅ TESTED & VERIFIED

---

## Pre-requisites
- Logged in as `priya@example.com / password123`
- Dev server running on `http://localhost:3000`

---

## TEST SUITE 1: Dashboard (`/dashboard`)

### TC-1.1: Page Load & Welcome Section
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/dashboard` | Welcome card shows "Hello, Priya 💜" |
| 2 | Check subtitle | "Your journey to finding love continues" visible |
| 3 | Check profile completion bar | Shows 40% bar (if profile incomplete) |
| 4 | Check "Complete Profile" button | Links to `/onboarding` |

### TC-1.2: Stats Grid
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check 4 stat cards | Profile Views, Interests Received, Mutual Matches, Shortlisted By shown |
| 2 | Check stat values | Numbers display (fetched from API) |
| 3 | Click any stat card | Links to `/matches` |

### TC-1.3: AI Daily Picks
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check "AI Daily Picks" section | Shows up to 3 profile cards |
| 2 | Verify gender filter | Only opposite gender shown (Male profiles for Priya) |
| 3 | Check profile card info | Shows name, age, city, education, compatibility % |
| 4 | Click a profile card | Navigates to `/profile/[id]` |
| 5 | Check "View All" link | Links to `/search` |

### TC-1.4: Loading State
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Throttle network (DevTools) | Skeleton pulse animations appear |
| 2 | Wait for load | Skeletons replaced with real data |

### TC-1.5: Auth Guard
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Logout and visit `/dashboard` | Redirects to `/login` |

---

## TEST SUITE 2: Profile Detail Page (`/profile/[id]`)

### TC-2.1: View Another User's Profile
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/profile/2` (Rahul Verma) | Profile loads with full details |
| 2 | Check displayed info | Name, age, religion, caste, education, occupation, income, city |
| 3 | Check "About Me" section | Bio text displayed |
| 4 | Check Partner Preferences | Age range, religion, education, city shown |
| 5 | Check verified badge | Blue check shown for verified profiles |

### TC-2.2: Send Interest
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Send Interest" button | Button changes to "Interest Sent ✓" |
| 2 | Click again | Nothing happens (already sent state) |

### TC-2.3: Compatibility Score
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check compatibility section | Score %, level, and factors displayed |
| 2 | Score is 0-100% | Within valid range |

### TC-2.4: Report & Block
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click Report icon | Report modal opens |
| 2 | Select reason + details, submit | "Report Sent" confirmation shown |
| 3 | Click Block button | Confirmation + "Blocked" state shown |
| 4 | Profile UI shows blocked state | "This profile has been blocked" indicator |

### TC-2.5: Non-existent Profile
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/profile/99999` | Shows "Profile not found" or empty state |

---

## TEST SUITE 3: My Profile (`/profile`)

### TC-3.1: View Own Profile
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/profile` | Shows logged-in user's profile |
| 2 | Check all fields | Name, age, personal details, about section |
| 3 | Check edit capability | Edit buttons/toggle available |

### TC-3.2: Edit Profile
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click Edit/toggle edit mode | Fields become editable |
| 2 | Change "about" text | Input field shows current text, allows editing |
| 3 | Save changes | Success notification/toast shown |
| 4 | Refresh page | Changes persist |

---

## TEST SUITE 4: Onboarding (`/onboarding`)

### TC-4.1: Multi-Step Onboarding Flow
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/onboarding` | First step (basic info) shown |
| 2 | Fill required fields, click Next | Next step loads |
| 3 | Complete all steps | Profile marked as complete |
| 4 | Final submit | Redirects to `/dashboard` |

### TC-4.2: Step Validation
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Try to skip required fields | Error messages shown |
| 2 | Go back to previous step | Data is retained |

---

## Bugs Fixed During QA
1. **Dashboard fetchActivity null crash**: `user!.id` assertion replaced with `if (!user) return` guard to prevent crash if user logs out during async fetch

---

## Known Limitations
- Profile photos are placeholder initials (no actual image upload)
- Activity counts are simulated from in-memory DB
- Profile completion percentage is hardcoded at 40%
