# QA Test Plan: Authentication System

## Module: Login, Registration, Session Management
## Status: ✅ TESTED & VERIFIED

---

## Pre-requisites
- Dev server running on `http://localhost:3000`
- Fresh browser (clear localStorage before testing)

---

## TEST SUITE 1: Login Page (`/login`)

### TC-1.1: Page Load
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/login` | Login page loads with Heart icon, "Welcome Back" heading |
| 2 | Check demo credentials visible | Demo box shows `priya@example.com / password123` |
| 3 | Check form fields | Email & password inputs present with icons |
| 4 | Check navigation link | "Create Account" link points to `/register` |

### TC-1.2: Successful Login
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enter `priya@example.com` in email | Field accepts input |
| 2 | Enter `password123` in password | Field shows dots (masked) |
| 3 | Click "Sign In" | Button shows "Signing in..." spinner |
| 4 | Wait for redirect | Redirects to `/dashboard` |
| 5 | Check Navbar | Shows user navigation (Dashboard, Search, etc.) |
| 6 | Check localStorage | `shadiMatch_user` and `shadiMatch_token` stored |

### TC-1.3: Failed Login
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enter `wrong@email.com` | Field accepts input |
| 2 | Enter `wrongpass` | Field accepts input |
| 3 | Click "Sign In" | Error: "Invalid credentials. Try: priya@example.com / password123" |
| 4 | Check URL | Stays on `/login` |

### TC-1.4: Password Visibility Toggle
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Type password | Shows as dots |
| 2 | Click eye icon | Password becomes visible text |
| 3 | Click eye icon again | Password hidden again |

### TC-1.5: Form Validation
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Leave email empty, click submit | Browser validation: "Please fill in this field" |
| 2 | Enter invalid email format | Browser validation: "Please include an '@'" |
| 3 | Leave password empty | Browser validation prevents submit |

---

## TEST SUITE 2: Registration Page (`/register`)

### TC-2.1: Multi-Step Form Navigation
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/register` | Step 1 visible: Name + Email |
| 2 | Fill name and email, click Continue | Step 2 loads: Gender + DOB |
| 3 | Fill gender and DOB, click Continue | Step 3 loads: Password fields |
| 4 | Progress bar updates | Steps highlight correctly (purple) |

### TC-2.2: Step Validation
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | On Step 1, leave name empty, click Continue | Error: "Please fill all fields" |
| 2 | On Step 2, leave gender empty, click Continue | Error: "Please fill all fields" |
| 3 | On Step 3, mismatched passwords | Error: "Passwords do not match" |
| 4 | On Step 3, short password (<6 chars) | Error: "Password must be at least 6 characters" |

### TC-2.3: Successful Registration
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Fill all steps correctly | No errors shown |
| 2 | Submit | Redirects to `/onboarding` |
| 3 | Check localStorage | User data stored |
| 4 | Check Navbar | Shows authenticated state |

### TC-2.4: Duplicate Email
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Register with `priya@example.com` | Error: "Registration failed. Email might already be registered." |

### TC-2.5: Age Validation (Backend)
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Set DOB to make age < 18 | Backend returns 400: "Must be 18 or older" |

---

## TEST SUITE 3: Session Management

### TC-3.1: Persistence
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Login successfully | Session stored |
| 2 | Refresh page | User stays logged in |
| 3 | Navigate between pages | Auth state persists |

### TC-3.2: Logout
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click Logout (desktop: red icon, mobile: "Logout" link) | Redirected to home |
| 2 | Check localStorage | `shadiMatch_user` and `shadiMatch_token` removed |
| 3 | Navigate to `/dashboard` | Redirects to `/login` |

### TC-3.3: Protected Routes
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Clear localStorage, go to `/dashboard` | Redirects to `/login` |
| 2 | Go to `/messages` | Redirects to `/login` |
| 3 | Go to `/profile` | Redirects to `/login` |
| 4 | Go to `/family` | Redirects to `/login` |
| 5 | Go to `/coach` | Redirects to `/login` |
| 6 | Go to `/search` (public) | Loads (search is accessible without login) |
| 7 | Go to `/events` (public) | Loads |

---

## Bugs Fixed During QA
1. **Search page crash**: `fetchProfiles()` was called even when `user` was null — fixed with `if (user)` guard
2. **Dashboard null assertion**: `user!.id` could crash if user logged out during fetch — fixed with null check

---

## API Endpoints Tested

| Endpoint | Method | Status |
|----------|--------|--------|
| `/api/auth/login` | POST | ✅ 200 OK (valid), 401 (invalid), 400 (missing fields) |
| `/api/auth/register` | POST | ✅ 201 (success), 409 (duplicate), 400 (missing/underage) |

---

## Known Limitations (Not Bugs)
- Password not hashed with bcrypt (marked as "production TODO" in code)
- Token is base64-encoded, not JWT (simplified for demo)
- Demo accepts any password === `password123` for seed users
