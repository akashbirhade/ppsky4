# QA Test Plan: Matches & Activity Tracking

## Module: Matches Page, Activity APIs, Interests, Shortlist, Views
## Status: ✅ TESTED & VERIFIED

---

## Pre-requisites
- Logged in as `priya@example.com / password123`
- Dev server running on `http://localhost:3000`

---

## TEST SUITE 1: Matches Page (`/matches`)

### TC-1.1: Page Load
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/matches` | Page loads with matches heading |
| 2 | Check auth guard | Redirects to `/login` if not logged in |
| 3 | Check tabs/sections | Interests, Mutual Matches, Shortlisted, Views |

### TC-1.2: Tab Navigation
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Interests Received" | Shows profiles who sent interest |
| 2 | Click "Mutual Matches" | Shows mutual match profiles |
| 3 | Click "Shortlisted By" | Shows profiles who shortlisted you |
| 4 | Click "Who Viewed Me" | Shows recent profile viewers |
| 5 | Each tab shows count | Badge with number |

### TC-1.3: Match Cards
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check profile cards | Name, age, city, photo/initials |
| 2 | Action buttons | Accept/Decline interest, Message, View Profile |
| 3 | Click profile card | Navigates to `/profile/[id]` |

---

## TEST SUITE 2: Activity APIs

### TC-2.1: Get Match Counts
```bash
curl "http://localhost:3000/api/activity/matches?userId=1&type=counts"
```
| Expected Response | `{ counts: { profileViews, interestsReceived, interestsSent, shortlistedBy, mutualMatches, recentVisitors } }` |

### TC-2.2: Get Profile Views
```bash
curl "http://localhost:3000/api/activity/views?userId=1&type=visitors"
```
| Expected Response | `{ profiles: [...] }` array of viewer profiles |

### TC-2.3: Get Interests
```bash
curl "http://localhost:3000/api/activity/interests?userId=1"
```
| Expected Response | `{ interests: [...] }` array of interest records |

### TC-2.4: Get Shortlist
```bash
curl "http://localhost:3000/api/activity/shortlist?userId=1"
```
| Expected Response | `{ shortlisted: [...] }` or similar |

---

## TEST SUITE 3: Send/Receive Interests

### TC-3.1: Send Interest Flow
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View a profile | "Send Interest" button visible |
| 2 | Click Send Interest | Button state changes to "Interest Sent" |
| 3 | Check matches page | Appears in "Sent Interests" tab |

### TC-3.2: Accept Interest Flow
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check received interests | Accept/Decline buttons |
| 2 | Click Accept | Becomes mutual match |
| 3 | Check Mutual Matches tab | Profile appears here |

---

## TEST SUITE 4: Activity Counts on Dashboard

### TC-4.1: Stats Integration
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Go to Dashboard | Stats grid shows counts |
| 2 | Profile Views count | Matches API response |
| 3 | Interests count | Matches API response |
| 4 | Mutual Matches count | Matches API response |
| 5 | Shortlisted By count | Matches API response |

---

## Known Limitations
- Activity data is simulated (in-memory)
- Interests reset on server restart
- No real-time notification when interest received
- Mutual match detection is simplified
- No interest expiration
