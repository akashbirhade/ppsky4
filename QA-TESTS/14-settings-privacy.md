# QA Test Plan: Settings & Privacy

## Module: Settings Page, Privacy Controls, Notification Preferences, Account Danger Zone
## Status: ✅ TESTED & VERIFIED

---

## Pre-requisites
- Logged in as any user
- Dev server running on `http://localhost:3000`

---

## TEST SUITE 1: Settings Page (`/settings`)

### TC-1.1: Page Load
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/settings` | Page loads with Shield icon + "Privacy & Settings" heading |
| 2 | Check auth guard | Redirects to `/login` if not logged in |
| 3 | Check sections | Privacy, Notifications, Language, Blocked Users, Danger Zone |

---

## TEST SUITE 2: Privacy Settings

### TC-2.1: Toggle Controls
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | "Hide Profile from Search" toggle | Toggles on/off |
| 2 | "Hide Photos" toggle | Toggles on/off |
| 3 | "Hide Income Details" toggle | Toggles on/off |
| 4 | "Hide Phone Number" toggle | Default: ON (true) |
| 5 | "Show Only Verified Profiles" toggle | Toggles on/off |

### TC-2.2: Who Can Contact Dropdown
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check options | "Everyone", "Premium Only", "None" |
| 2 | Select "Premium Only" | Selection updates |
| 3 | Select "None" | Selection updates |

### TC-2.3: Save Settings
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Change any toggle | Enable save |
| 2 | Click "Save Settings" | Saves (API call or local state) |
| 3 | Check success indicator | "Saved" confirmation |

---

## TEST SUITE 3: Notification Preferences

### TC-3.1: Notification Toggles
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check notification section | Bell icon + heading |
| 2 | Toggle options present | Email, Push, Match alerts, etc. |

---

## TEST SUITE 4: Language Settings

### TC-4.1: Language Cards
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check "Language / भाषा" section | Globe icon + heading |
| 2 | Three language cards | English, हिंदी (Hindi), मराठी (Marathi) |
| 3 | Current language highlighted | Purple border + glow |
| 4 | Click "हिंदी" | Language switches app-wide |
| 5 | Click "मराठी" | Language switches to Marathi |
| 6 | Click "English" | Language switches back |

### TC-4.2: Language Persistence
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Select Hindi | App updates |
| 2 | Navigate to other pages | Hindi persists |
| 3 | Return to settings | Hindi card still selected |

---

## TEST SUITE 5: Blocked Users

### TC-5.1: Blocked Users List
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check blocked users section | Shows list or "No blocked users" |
| 2 | If users blocked | Unblock button available |

---

## TEST SUITE 6: Danger Zone

### TC-6.1: Danger Zone Visibility
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check danger zone section | Red-themed section with AlertTriangle icon |
| 2 | Check actions | "Deactivate Account", "Delete Account" options |
| 3 | Buttons are destructive-styled | Red borders, warning colors |

### TC-6.2: Destructive Action Safety
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click deactivate | Should show confirmation (or it's client-side demo) |
| 2 | Click delete | Should show confirmation prompt |

---

## TEST SUITE 7: API - Privacy Settings

### TC-7.1: Save Privacy Settings
```bash
curl -X POST http://localhost:3000/api/privacy \
  -H "Content-Type: application/json" \
  -d '{"userId": "1", "settings": {"hideProfile": true, "hidePhone": true}}'
```
| Expected | Success response |

### TC-7.2: Get Privacy Settings
```bash
curl "http://localhost:3000/api/privacy?userId=1"
```
| Expected | Current privacy settings object |

---

## Known Limitations
- Settings may not persist across server restarts (in-memory)
- Deactivate/Delete are UI-only (no actual account deletion)
- Notification preferences are client-side toggles (no push notification infra)
- Blocked users list fetched from API but block happens on profile page
