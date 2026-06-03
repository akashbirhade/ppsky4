# QA Test Plan: Kundali Matching

## Module: Kundali Page, Compatibility API, Astrological Matching
## Status: ✅ TESTED & VERIFIED

---

## Pre-requisites
- Logged in as `priya@example.com / password123`
- Dev server running on `http://localhost:3000`

---

## TEST SUITE 1: Kundali Page (`/kundali`)

### TC-1.1: Page Load
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/kundali` | Page loads with astrology-themed UI |
| 2 | Check heading | Kundali-related heading with Star/Moon icons |
| 3 | Check auth guard | Redirects to `/login` if not logged in |
| 4 | Check profile dropdown | Lists opposite-gender profiles |

### TC-1.2: Profile Selection
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check dropdown options | Shows Male profiles (Rahul, Vikram, Arjun) |
| 2 | Select "Rahul Verma" | Dropdown shows selection |
| 3 | Check "Check Kundali" button | Becomes clickable after selection |

### TC-1.3: Generate Kundali Result
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Select a profile | Profile selected |
| 2 | Click check button | Loading state shows |
| 3 | Wait for result | Kundali result card appears |
| 4 | Check score | Shows percentage (0-100%) |
| 5 | Check Guna score | Shows X/36 format |
| 6 | Check Manglik status | "Yes", "No", or "Partial" |
| 7 | Check Nakshatra Match | "Excellent", "Good", or "Average" |
| 8 | Check recommendation | "Highly Recommended", "Good Match", "Average Match", or "Consult Astrologer" |
| 9 | Check profile name | Shows selected person's name |

### TC-1.4: Score Consistency
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check same profiles twice | Same score returned (deterministic based on IDs) |
| 2 | Check different profiles | Different scores for different combinations |

### TC-1.5: No Selection Guard
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Without selecting profile, click check | Nothing happens (guard: `if (!selectedProfile) return`) |

---

## TEST SUITE 2: Kundali API (`/api/activity/kundali`)

### TC-2.1: Valid Request
```bash
curl "http://localhost:3000/api/activity/kundali?userId=1&profileId=2"
```
| Expected | `{ kundali: { score, manglik, nakshatraMatch, gunaScore, recommendation } }` |

### TC-2.2: Missing Parameters
```bash
curl "http://localhost:3000/api/activity/kundali?userId=1"
```
| Expected | `{ error: "userId and profileId required" }` status 400 |

### TC-2.3: Score Range Validation
| Check | Expected |
|-------|----------|
| `gunaScore` | Between 18-36 |
| `score` | Between 50-100% (calculated as gunaScore/36 * 100) |
| `manglik` | One of: "Yes", "No", "Partial" |
| `nakshatraMatch` | One of: "Excellent", "Good", "Average" |

---

## Known Limitations
- Kundali is simulated (deterministic hash, not real astrology calculations)
- No actual birth chart generation
- Same user-profile pair always gives same result (based on ID hash)
- No Kundali PDF download
