# QA Test Plan: Wedding Vendor Marketplace

## Module: Vendors Page, Categories, Search, Contact
## Status: ✅ TESTED & VERIFIED

---

## Pre-requisites
- Dev server running on `http://localhost:3000`
- No login required (public page)

---

## TEST SUITE 1: Vendors Page (`/vendors`)

### TC-1.1: Page Load
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/vendors` | Page loads with "Wedding Vendors" heading |
| 2 | Check Store icon | Present in heading |
| 3 | Check subtitle | Description about finding wedding vendors |

### TC-1.2: Category Navigation
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check category bar | 9 categories: All, Venues, Photography, Catering, Decoration, Music & DJ, Makeup, Jewelry, Invitations |
| 2 | Default selection | "All" is highlighted |
| 3 | Click "Venues" | Only venue vendors shown |
| 4 | Click "Photography" | Only photography vendors shown |
| 5 | Click "All" again | All vendors shown |
| 6 | Each category has icon | Building, Camera, Utensils, etc. |

### TC-1.3: Vendor Cards
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check vendor card layout | Shows emoji image, name, rating, reviews, price, city |
| 2 | Vendor 1: "Royal Palace Banquets" | Rating 4.8, 234 reviews, ₹5-15L, Mumbai |
| 3 | Vendor 2: "Candid Click Studios" | Rating 4.9, 189 reviews, ₹1-3L, Delhi |
| 4 | Check verified badge | Checkmark for verified vendors |
| 5 | Check premium badge | Crown for premium vendors |
| 6 | Check tags | Tag chips below description (e.g., "Candid", "Pre-wedding") |

---

## TEST SUITE 2: Search & Filter

### TC-2.1: Search by Name
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Type "Royal" in search input | Only "Royal Palace Banquets" shown |
| 2 | Type "xyz" | No vendors shown |
| 3 | Clear search | All vendors return |

### TC-2.2: Combined Category + Search
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Select "Photography" category | Shows photography vendors |
| 2 | Search "Candid" | Shows "Candid Click Studios" only |
| 3 | Clear search, select "All" | All vendors shown |

---

## TEST SUITE 3: Vendor Interactions

### TC-3.1: Contact Reveal
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find "View Contact" / Phone button | Present on vendor cards |
| 2 | Click contact button | Contact info revealed or CTA shown |

### TC-3.2: Vendor Registration CTA
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check bottom of page | "Are you a vendor?" CTA section |
| 2 | Check CTA content | Invitation to register as vendor |

---

## TEST SUITE 4: Data Integrity

### TC-4.1: Vendor Data Validation
| Check | Expected |
|-------|----------|
| All vendors have unique IDs | ✅ '1' through '9' |
| Rating range | 4.0-5.0 (realistic) |
| Reviews count | > 0 |
| Price format | ₹ with appropriate range |
| City | Valid Indian city names |
| Category | One of defined categories |

### TC-4.2: Category Count
| Category | Expected Vendors |
|----------|-----------------|
| venue | ≥1 |
| photography | ≥1 |
| catering | ≥1 |
| decoration | ≥1 |
| music | ≥1 |
| makeup | ≥1 |
| jewelry | ≥1 |
| invitation | ≥1 |

---

## Known Limitations
- Vendors are mock data (not from real API)
- No booking/inquiry form
- No vendor reviews system
- Contact reveal is UI-only
- No location-based filtering
- No price range slider filter
