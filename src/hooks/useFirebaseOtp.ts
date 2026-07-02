'use client'

import { useState, useCallback, useRef } from 'react'
import { getFirebaseAuth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from '@/lib/firebase'

export function useFirebaseOtp() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [otpSent, setOtpSent] = useState(false)
  const confirmationRef = useRef<ConfirmationResult | null>(null)
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null)

  // Initialize invisible reCAPTCHA
  const setupRecaptcha = useCallback((buttonId: string) => {
    if (recaptchaRef.current) return

    recaptchaRef.current = new RecaptchaVerifier(getFirebaseAuth(), buttonId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved
      },
      'expired-callback': () => {
        setError('reCAPTCHA expired. Please try again.')
        recaptchaRef.current = null
      },
    })
  }, [])

  // Send OTP to phone number
  const sendOtp = useCallback(async (phoneNumber: string) => {
    setLoading(true)
    setError(null)

    try {
      // Format phone number with +91 prefix for India
      const formattedPhone = phoneNumber.startsWith('+')
        ? phoneNumber
        : `+91${phoneNumber.replace(/\D/g, '')}`

      if (!recaptchaRef.current) {
        throw new Error('reCAPTCHA not initialized. Call setupRecaptcha first.')
      }

      const confirmation = await signInWithPhoneNumber(getFirebaseAuth(), formattedPhone, recaptchaRef.current)
      confirmationRef.current = confirmation
      setOtpSent(true)
      return { success: true }
    } catch (err: any) {
      const message = getFirebaseErrorMessage(err.code)
      setError(message)
      // Reset reCAPTCHA on error
      recaptchaRef.current = null
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  // Verify OTP code
  const verifyOtp = useCallback(async (otp: string) => {
    setLoading(true)
    setError(null)

    try {
      if (!confirmationRef.current) {
        throw new Error('No OTP was sent. Please request OTP first.')
      }

      const result = await confirmationRef.current.confirm(otp)
      const firebaseUser = result.user
      const idToken = await firebaseUser.getIdToken()

      return {
        success: true,
        firebaseUid: firebaseUser.uid,
        phoneNumber: firebaseUser.phoneNumber,
        idToken,
      }
    } catch (err: any) {
      const message = getFirebaseErrorMessage(err.code)
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  // Reset state
  const reset = useCallback(() => {
    setOtpSent(false)
    setError(null)
    confirmationRef.current = null
    recaptchaRef.current = null
  }, [])

  return { sendOtp, verifyOtp, setupRecaptcha, reset, loading, error, otpSent }
}

function getFirebaseErrorMessage(code: string): string {
  switch (code) {
    case 'auth/invalid-phone-number':
      return 'Invalid phone number. Please enter a valid Indian mobile number.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.'
    case 'auth/quota-exceeded':
      return 'SMS quota exceeded. Please try again tomorrow.'
    case 'auth/invalid-verification-code':
      return 'Invalid OTP. Please check and try again.'
    case 'auth/code-expired':
      return 'OTP has expired. Please request a new one.'
    case 'auth/missing-verification-code':
      return 'Please enter the OTP code.'
    case 'auth/captcha-check-failed':
      return 'reCAPTCHA verification failed. Please refresh and try again.'
    default:
      return 'Something went wrong. Please try again.'
  }
}
