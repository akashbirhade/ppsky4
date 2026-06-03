# QA Test Plan: Video Calling & Scheduling

## Module: Call Page, Audio/Video Call Simulation, Call Scheduling
## Status: ✅ TESTED & VERIFIED

---

## Pre-requisites
- Logged in as any user
- Dev server running on `http://localhost:3000`

---

## TEST SUITE 1: Call Page - Idle State (`/call`)

### TC-1.1: Page Load
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/call` | Page loads with Video icon header |
| 2 | Check heading | "Connect via Call" with subtitle about safe calls |
| 3 | Check auth guard | Redirects to `/login` if not logged in |

### TC-1.2: Recent Matches Section
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check contacts list | 3 contacts: Priya Sharma, Ananya Desai, Meera Patel |
| 2 | Check avatar initials | "PS", "AD", "MP" shown |
| 3 | Check online status | Green "Online" text for all |
| 4 | Check call buttons | Phone (green) + Video (blue) buttons per contact |

### TC-1.3: Safety Features Section
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check safety section | "Safe Calling Features" with 4 bullet points |
| 2 | Verify content | Number masking, encryption, report/block, premium info |

### TC-1.4: Schedule a Call Section
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check scheduling UI | Date picker, time picker, match dropdown, Schedule button |
| 2 | Select date | Calendar opens, date selectable |
| 3 | Select time | Time picker works |
| 4 | Select match dropdown | Shows 3 options: Priya, Ananya, Meera |
| 5 | Click "Schedule" button | UI acknowledges (no backend persistence) |

---

## TEST SUITE 2: Audio Call Flow

### TC-2.1: Start Audio Call
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click Phone (green) button on any contact | State changes to "calling" |
| 2 | Check calling UI | Shows caller name, "Calling..." animation |
| 3 | Wait 3 seconds | Auto-connects (state: "connected") |
| 4 | Check connected UI | Timer starts (00:00, 00:01, 00:02...) |
| 5 | Check call type indicator | Audio call indicated |

### TC-2.2: Audio Call Controls
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click Mute button | Mic icon toggles (Mic → MicOff) |
| 2 | Click again | Unmutes (MicOff → Mic) |
| 3 | Check Volume button | Volume icon present |

---

## TEST SUITE 3: Video Call Flow

### TC-3.1: Start Video Call
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click Video (blue) button on any contact | State changes to "calling" |
| 2 | Wait 3 seconds | Auto-connects with video call UI |
| 3 | Check timer | Duration counter starts |
| 4 | Check video placeholder | Avatar/gradient shown (simulated video) |

### TC-3.2: Video Call Controls
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click Camera Off button | Video toggles (Video → VideoOff) |
| 2 | Click again | Video re-enabled |
| 3 | Click Mute | Mic toggles |
| 4 | Check layout | Self-view (small) + remote view (large) areas |

---

## TEST SUITE 4: End Call

### TC-4.1: End Active Call
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | During connected call, click red End Call button | State: "ended" |
| 2 | Check "Call Ended" text | Shows briefly |
| 3 | Wait 2 seconds | Returns to idle state automatically |
| 4 | Timer resets | Duration back to 0 |

---

## TEST SUITE 5: Duration Timer

### TC-5.1: Timer Accuracy
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Start call, wait for connection | Timer starts at 00:00 |
| 2 | Count 10 seconds | Timer shows 00:10 |
| 3 | Wait until 01:00 | Shows "01:00" |
| 4 | End call | Timer stops, resets |

### TC-5.2: Timer Cleanup
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Start call | Timer interval starts |
| 2 | Navigate away from page | No memory leak (interval cleared) |
| 3 | Return to `/call` | Fresh state, no running timer |

---

## Known Limitations
- Calls are simulated (no WebRTC/real call)
- Auto-answer after 3 seconds (no real ringing)
- Call scheduling doesn't persist (no backend API for scheduling)
- Same 3 hardcoded contacts (not from actual matches)
- No call recording or duration history
