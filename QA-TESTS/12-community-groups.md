# QA Test Plan: Community Groups

## Module: Community Page, Group Join/Leave, Search, Categories
## Status: ✅ TESTED & VERIFIED

---

## Pre-requisites
- Dev server running on `http://localhost:3000`
- No login required (public page)

---

## TEST SUITE 1: Community Page (`/community`)

### TC-1.1: Page Load
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/community` | Page loads with Users icon + heading |
| 2 | Check group count | 12 groups displayed |
| 3 | Check "Your Groups" summary | Shows count of joined groups (default: 3) |

### TC-1.2: Category Tabs
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check tabs | 8 tabs: All, Community, Regional, Professional, NRI, Parents, Support, Lifestyle |
| 2 | Default: "All Groups" selected | All 12 groups visible |
| 3 | Click "Regional" | Only region-category groups shown |
| 4 | Click "Professional" | IT, Doctors, MBA groups shown |
| 5 | Click "NRI" | NRI Shaadi Network shown |
| 6 | Click "Parents" | Parents Connect Forum shown |
| 7 | Click "Support" | Second Marriage Support shown |

---

## TEST SUITE 2: Group Cards

### TC-2.1: Card Display
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check group card | Icon, name, description, member count, recent posts |
| 2 | Verified groups | CheckCircle icon shown |
| 3 | Member count format | "12.5K" for 12500, "8.9K" for 8900 |
| 4 | Recent posts | Number badge shown |

### TC-2.2: Joined vs Not Joined
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check joined groups (default 3) | Button shows "Joined" or "Leave" state |
| 2 | Check non-joined groups | Button shows "Join" |
| 3 | Joined groups have visual indicator | Different button styling |

---

## TEST SUITE 3: Join/Leave Groups

### TC-3.1: Join a Group
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find non-joined group (e.g., "Gujarati Patel Community") | "Join" button visible |
| 2 | Click "Join" | Button changes to "Joined"/"Leave" |
| 3 | Member count increases by 1 | 8900 → 8901 |
| 4 | "Your Groups" count updates | Increments by 1 |

### TC-3.2: Leave a Group
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find joined group (e.g., "Maharashtra Matrimony Connect") | "Leave"/"Joined" button |
| 2 | Click Leave | Button changes to "Join" |
| 3 | Member count decreases by 1 | 12500 → 12499 |
| 4 | "Your Groups" count updates | Decrements by 1 |

### TC-3.3: Toggle Behavior
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Join → Leave → Join | Toggles correctly each time |
| 2 | Member count | Accurate after each toggle |

---

## TEST SUITE 4: Search

### TC-4.1: Search by Name
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Type "NRI" in search box | "NRI Shaadi Network" shown |
| 2 | Type "Doctor" | "Doctors & Medical Professionals" shown |
| 3 | Type "Maharashtra" | "Maharashtra Matrimony Connect" shown |
| 4 | Type "zzz" | No groups shown |
| 5 | Clear search | All groups return |

### TC-4.2: Search + Category Filter
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Select "Professional" tab | 3 professional groups |
| 2 | Type "MBA" | Only "MBA & Business Professionals" |
| 3 | Clear search | All professional groups return |

---

## TEST SUITE 5: Create Group CTA

### TC-5.1: CTA Section
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check bottom of page | "Create a Group" section/CTA |
| 2 | Check content | Invites users to start their own community |

---

## TEST SUITE 6: Data Integrity

### TC-6.1: All 12 Groups Present
| # | Group | Category | Members |
|---|-------|----------|---------|
| 1 | Maharashtra Matrimony Connect | region | 12,500 |
| 2 | Gujarati Patel Community | community | 8,900 |
| 3 | NRI Shaadi Network | nri | 15,200 |
| 4 | IT Professionals Match | profession | 22,000 |
| 5 | Brahmin Vivah Mandal | community | 6,700 |
| 6 | Doctors & Medical Professionals | profession | 9,800 |
| 7 | Delhi NCR Singles | region | 18,500 |
| 8 | Second Marriage Support | support | 4,200 |
| 9 | Interfaith & Progressive | lifestyle | 7,300 |
| 10 | Parents Connect Forum | parents | 11,000 |
| 11 | Sikh Matrimony Circle | community | 5,600 |
| 12 | MBA & Business Professionals | profession | 13,400 |

### TC-6.2: Default Joined Groups
| Group | Joined by Default |
|-------|------------------|
| Maharashtra Matrimony Connect | ✅ Yes |
| NRI Shaadi Network | ✅ Yes |
| Parents Connect Forum | ✅ Yes |
| All others | ❌ No |

---

## Known Limitations
- Groups are client-side state (reset on page reload)
- No actual group posts/discussions
- No group chat functionality
- No admin/moderation for groups
- Member counts are simulated
- "Create Group" is CTA only (no form)
