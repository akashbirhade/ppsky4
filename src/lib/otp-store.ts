type OtpPurpose = 'register' | 'login'

type OtpEntry = {
  otp: string
  expiresAt: number
  purpose: OtpPurpose
}

// In-memory OTP store for demo mode; use Redis in production.
const otpStore = new Map<string, OtpEntry>()

export function getOtpStore() {
  return otpStore
}
