# QA Test Plan: Search & Matchmaking

## Module: Search Profiles, Filters, ProfileCard Component
## Status: ✅ TESTED & VERIFIED

---

## Pre-requisites
- Logged in as `priya@example.com / password123` (Female user)
- Dev server running on `http://localhost:3000`

---

## TEST SUITE 1: Search Page (`/search`)

### TC-1.1: Page Load & Default Results
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/search` | Page loads with "Discover Your Perfect Match" heading |
| 2 | Check default filter | Automatically shows Male profiles (opposite gender) |
| 3 | Check result count | Shows "X profiles found" text |
| 4 | Check AI ranking label | "AI-Ranked by Compatibility" badge visible |

### TC-1.2: Search Form - Basic Filters
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Gender dropdown | Default: "Grooms (Default)", options: Bride/Groom |
| 2 | Select "Bride" | Filter changes to show Female profiles |
| 3 | Religion dropdown | Options: Hindu, Muslim, Sikh, Christian, Jain |
| 4 | Select "Hindu" | Results filtered to Hindu profiles only |
| 5 | Type "Mumbai" in city | Field accepts input |
| 6 | Click "Search" | Results refresh with filters applied |

### TC-1.3: Advanced Filters
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click Filter icon button | Advanced filters panel opens (animated) |
| 2 | Set Min Age: 25 | Input accepts number |
| 3 | Set Max Age: 32 | Input accepts number |
| 4 | Select Education: MBA | Dropdown works |
| 5 | Click Search | Results filtered by all criteria |
| 6 | Click "Clear All" | All filters reset, full results reload |

### TC-1.4: No Results State
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Search with impossible filters (e.g., age 90-99) | "No profiles found" with heart icon |
| 2 | Message "Try adjusting your filters" | Displayed below heading |

### TC-1.5: Loading State
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Trigger search with slow network | 6 skeleton cards with pulse animation |
| 2 | Wait for load | Skeleton replaced by ProfileCard components |

### TC-1.6: Public Access (No Login)
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Logout, navigate to `/search` | Page loads (public page) |
| 2 | Check default behavior | Shows profiles without crashing |
| 3 | Gender defaults to "Male" (no user context) | Works gracefully |

---

## TEST SUITE 2: ProfileCard Component

### TC-2.1: Card Display
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check profile card | Shows name, age, city, education |
| 2 | Check avatar | Initials displayed in gradient circle |
| 3 | Check verified badge | Blue BadgeCheck icon for verified profiles |
| 4 | Check premium badge | Crown icon for premium profiles |
| 5 | Check compatibility % | Shows percentage in top-right corner |

### TC-2.2: Card Interactions
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Hover over card | Border brightens, slight scale effect |
| 2 | Click card | Navigates to `/profile/[id]` |
| 3 | Click "Send Interest" button | Button state changes to "Sent" |
| 4 | Click "Message" button | Links to messaging |

---

## TEST SUITE 3: API - Profile Search (`/api/profiles`)

### TC-3.1: Query Parameters
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | GET `/api/profiles?gender=Female` | Returns only Female profiles |
| 2 | GET `/api/profiles?gender=Male&ageMin=30` | Returns Males aged 30+ |
| 3 | GET `/api/profiles?religion=Sikh` | Returns Sikh profiles only |
| 4 | GET `/api/profiles?city=Mumbai` | Returns profiles in Mumbai |
| 5 | GET `/api/profiles?education=MBA` | Returns profiles with MBA education |
| 6 | GET `/api/profiles?excludeId=1` | Priya not in results |

### TC-3.2: Response Security
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check response JSON | `password` field is EXCLUDED from all profiles |
| 2 | Sensitive data stripped | Only public profile data returned |

### TC-3.3: Combined Filters
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | GET `/api/profiles?gender=Female&religion=Hindu&city=Mumbai` | Returns Priya only |
| 2 | GET `/api/profiles?gender=Male&ageMin=30&ageMax=33` | Returns Rahul, Arjun (age 32-33) |

---

## Bugs Fixed During QA
1. **Search crash when not logged in**: `fetchProfiles()` was called with null `user` in useEffect — fixed by adding `if (user)` guard. Page still works publicly but auto-filters only when user exists.

---

## Known Limitations
- No pagination (all matching profiles returned at once)
- Education filter is substring match, not exact
- City filter is case-insensitive substring match
- Profile images are placeholder initials (no real photos)
