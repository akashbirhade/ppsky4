# QA Test Plan: Family Account System

## Module: Family Members, Managed Profiles, Role Permissions
## Status: ✅ TESTED & VERIFIED

---

## Pre-requisites
- Logged in as any user
- Dev server running on `http://localhost:3000`

---

## TEST SUITE 1: Family Page (`/family`)

### TC-1.1: Page Load
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/family` | Page loads with "Family Account" heading |
| 2 | Check auth guard | Redirects to `/login` if not logged in |
| 3 | Check header | Users icon + "Family Account" title |
| 4 | Check "Add Family Member" button | Primary button in top-right |

### TC-1.2: Safety Banner
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check info banner | Shield icon with "Family Safety" message |
| 2 | Read content | Explains permission-based access model |

### TC-1.3: Default Family Members
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check members list | 3 default members shown |
| 2 | Member 1: "You (Account Owner)" | Role: admin, Crown icon, "Full Access" badge |
| 3 | Member 2: "Mrs. Sharma" | Role: manager, "Can Manage" badge |
| 4 | Member 3: "Mr. Sharma" | Role: viewer, "View Only" badge |
| 5 | Check avatars | 👤, 👩, 👨 emojis |
| 6 | Admin has no delete button | Only non-admin members have Trash2 icon |

---

## TEST SUITE 2: Add Family Member

### TC-2.1: Open Modal
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Add Family Member" | Modal/form appears |
| 2 | Check fields | Name, Email, Relation, Role inputs |

### TC-2.2: Add Valid Member
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enter name: "Uncle Ji" | Field accepts input |
| 2 | Enter email: "uncle@example.com" | Field accepts input |
| 3 | Enter relation: "Uncle" | Field accepts input |
| 4 | Select role: "viewer" | Dropdown selection |
| 5 | Click add/save | New member appears in list |
| 6 | Check list | Now shows 4 members |
| 7 | Check new member | Shows "Uncle Ji", "Uncle", "View Only" |

### TC-2.3: Add Invalid Member (Empty Fields)
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Leave name empty | Click add: nothing happens (guard: `if (!newMember.name || !newMember.email) return`) |
| 2 | Fill name, leave email empty | Click add: nothing happens |

### TC-2.4: Close Modal
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open add member form | Form visible |
| 2 | Click close/cancel | Form hides, no member added |

---

## TEST SUITE 3: Remove Family Member

### TC-3.1: Remove Non-Admin Member
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click Trash icon on "Mrs. Sharma" | Member removed from list |
| 2 | Check list | Now shows 2 members |
| 3 | Check "You" entry | Still present (can't be removed) |

### TC-3.2: Admin Protection
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check admin entry (id='1') | No Trash icon present |
| 2 | Cannot remove self | Admin entry is protected |

---

## TEST SUITE 4: Managed Profiles Section

### TC-4.1: View Managed Profile
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check managed profiles section | "Rahul Sharma" profile card |
| 2 | Check details | Age 29, Male, "2 hrs ago" last active |
| 3 | Check status badge | "● Active" (green) |
| 4 | Check stats | Interests: 12, Views: 45, Profile Score: 86% |

### TC-4.2: Profile Actions
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "View Dashboard" | Links to `/dashboard` |
| 2 | Click "Browse Matches" | Links to `/search` |

---

## TEST SUITE 5: Role Permissions Guide (Sidebar)

### TC-5.1: Permissions Display
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check sidebar card | "Role Permissions" heading with Settings icon |
| 2 | Admin section | Lists all permissions (full access) |
| 3 | Manager section | Lists manage permissions |
| 4 | Viewer section | Lists view-only permissions |

---

## Known Limitations
- Family data is client-side only (resets on page reload)
- No backend API for family member persistence
- No invitation system (email is stored but no invite sent)
- Managed profiles are mock data
- Role permissions are displayed but not enforced
