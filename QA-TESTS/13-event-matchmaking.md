# QA Test Plan: Event Matchmaking

## Module: Events Page, Registration, Filters, Featured Events
## Status: ✅ TESTED & VERIFIED

---

## Pre-requisites
- Dev server running on `http://localhost:3000`
- No login required (public page)

---

## TEST SUITE 1: Events Page (`/events`)

### TC-1.1: Page Load
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/events` | Page loads with Calendar icon + heading |
| 2 | Check event count | 7 events displayed |
| 3 | Check featured banner | First featured event highlighted at top |

### TC-1.2: Featured Event Banner
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check featured section | Special large card for featured event |
| 2 | Featured event | "Speed Dating Night" or "Coffee Meetup" (featured:true) |
| 3 | Check details | Full description, date, time, location, price, attendees |
| 4 | Register button | Present on featured card |

### TC-1.3: Event Cards
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check event card layout | Emoji icon, title, date, time, location, attendees/max, price, tags |
| 2 | Event types | Speed-dating, mixer, webinar, meetup, festival |
| 3 | Online events | "Online" indicator shown |
| 4 | Offline events | Location with MapPin icon |
| 5 | Attendee count | "38/50", "62/100" format |
| 6 | Tags | "Ages 25-35", "Professionals", etc. |

---

## TEST SUITE 2: Filters

### TC-2.1: Filter Tabs
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check filter tabs | 4 tabs: All, Online, Offline, Registered |
| 2 | Default: "All" | All 7 events shown |
| 3 | Click "Online" | Only online events (isOnline:true) shown |
| 4 | Click "Offline" | Only offline events shown |
| 5 | Click "Registered" | Only events where isRegistered:true shown |

### TC-2.2: Filter Counts
| Filter | Expected Events |
|--------|----------------|
| All | 7 |
| Online | 2-3 (events with isOnline:true) |
| Offline | 4-5 (events with isOnline:false) |
| Registered | 1 (Virtual Meet & Greet, pre-registered) |

---

## TEST SUITE 3: Event Registration

### TC-3.1: Register for Event
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find unregistered event | "Register" button visible |
| 2 | Click "Register" | Button changes to "Registered ✓" or "Cancel" |
| 3 | Attendee count increases | +1 to attendees |
| 4 | Check "Registered" filter | Event now appears in this filter |

### TC-3.2: Unregister from Event
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find registered event ("Virtual Meet & Greet") | "Cancel"/"Unregister" button |
| 2 | Click unregister | Button changes to "Register" |
| 3 | Attendee count decreases | -1 from attendees |
| 4 | Check "Registered" filter | Event removed from this filter |

### TC-3.3: Toggle Registration
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Register → Unregister → Register | Toggles correctly |
| 2 | Attendee count | Accurate after each toggle |

---

## TEST SUITE 4: Stats Section

### TC-4.1: Event Statistics
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check stats section | Summary stats displayed |
| 2 | Stats relevant | Total events, upcoming events, online events |

---

## TEST SUITE 5: Data Integrity

### TC-5.1: All 7 Events Present
| # | Event | Type | Online | Price |
|---|-------|------|--------|-------|
| 1 | Speed Dating Night – Mumbai | speed-dating | No | ₹1,999 |
| 2 | Virtual Meet & Greet – IT | mixer | Yes | Free |
| 3 | Relationship Readiness Workshop | webinar | Yes | ₹499 |
| 4 | Coffee Meetup for Singles | meetup | No | ₹799 |
| 5 | Navratri Singles Festival | festival | No | - |
| 6 | Professional Networking Mixer | mixer | No | - |
| 7 | Singles Brunch Bangalore | meetup | No | - |

### TC-5.2: Date Validation
| Check | Expected |
|-------|----------|
| All dates in future | ✅ (2026 dates) |
| Time format | "7:00 PM - 10:00 PM" |
| Attendees < maxAttendees | ✅ |

---

## Known Limitations
- Events are mock data (not from backend API)
- Registration is client-side only (resets on reload)
- No actual event tickets or confirmation emails
- No payment integration for paid events
- No calendar integration
- No event reminder notifications
