# QA Test Plan: Premium & Verification

## Module: Premium Page, Verify Page, Subscription Features
## Status: ✅ TESTED & VERIFIED

---

## Pre-requisites
- Dev server running on `http://localhost:3000`
- Logged in as any user

---

## TEST SUITE 1: Premium Page (`/premium`)

### TC-1.1: Page Load
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/premium` | Page loads with Premium heading + Crown icon |
| 2 | Check plan options | Multiple plans displayed (Basic, Premium, Elite/Gold) |
| 3 | Check pricing | ₹ pricing shown for each plan |
| 4 | Check features list | Each plan lists included features |

### TC-1.2: Plan Comparison
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check Basic plan | Limited features listed |
| 2 | Check Premium plan | More features, highlighted as "popular" |
| 3 | Check top plan | All features included |
| 4 | Visual distinction | Recommended plan has special styling/badge |

### TC-1.3: Feature List
| Feature Category | Verified |
|-----------------|----------|
| Unlimited messaging | ✅ |
| See who viewed you | ✅ |
| Advanced search filters | ✅ |
| Priority matching | ✅ |
| Video calling | ✅ |
| Profile boost | ✅ |
| Read receipts | ✅ |

### TC-1.4: Subscription CTA
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Subscribe" / "Upgrade" button | Simulated action (no payment gateway) |
| 2 | Button is prominent | Gold/gradient styling |

---

## TEST SUITE 2: Verification Page (`/verify`)

### TC-2.1: Page Load
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/verify` | Verification page loads |
| 2 | Check heading | Verification-related heading with BadgeCheck icon |
| 3 | Check verification methods | ID verification, photo verification listed |

### TC-2.2: Verification Methods
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | ID Verification section | Upload ID card option |
| 2 | Photo Verification section | Selfie verification option |
| 3 | Check upload UI | File input or camera button |
| 4 | Check status | "Verified" / "Pending" / "Not Verified" indicator |

### TC-2.3: Verification Benefits
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check benefits section | Lists why verification matters |
| 2 | Trust badge info | Explains the blue checkmark |
| 3 | More matches info | Verified profiles get more responses |

---

## TEST SUITE 3: Premium Features in App

### TC-3.1: Premium Indicators
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Check premium profiles in search | Crown badge visible |
| 2 | Check Navbar Premium button | Gold "Premium" button always visible |
| 3 | Premium upsell on features | "Upgrade to Premium" prompts on restricted features |

---

## Known Limitations
- No actual payment gateway integration
- Subscription is UI-only (no Razorpay/Stripe)
- ID verification is simulated (no real document check)
- Photo verification has no facial recognition
- Premium status doesn't restrict any features in demo mode
