import { test, expect } from '@playwright/test'

// Demo credentials from the seed data
const DEMO_USER = {
  email: 'priya@example.com',
  password: 'Test@123',
  name: 'Priya Sharma',
}

const DEMO_USER2 = {
  email: 'rahul@example.com',
  password: 'Test@123',
  name: 'Rahul Verma',
}

test.describe('Authentication Flow', () => {
  test('should show login page', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveTitle(/Soulmate Sync/)
    await expect(page.locator('text=Sign In')).toBeVisible()
  })

  test('should login with email/password', async ({ page }) => {
    await page.goto('/login')

    // Fill email and password
    await page.fill('input[type="email"]', DEMO_USER.email)
    await page.fill('input[type="password"]', DEMO_USER.password)

    // Click login
    await page.click('button[type="submit"]')

    // Should redirect to dashboard
    await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 10000 })
  })

  test('should reject invalid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[type="email"]', 'wrong@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    // Should show error
    await expect(page.locator('text=Invalid email or password').or(page.locator('[role="alert"]'))).toBeVisible({ timeout: 5000 })
  })

  test('should show OTP login option', async ({ page }) => {
    await page.goto('/login')

    // Look for OTP/phone login option
    const otpButton = page.locator('text=OTP').or(page.locator('text=Phone'))
    if (await otpButton.isVisible()) {
      await otpButton.click()
      await expect(page.locator('input[type="tel"]').or(page.locator('input[placeholder*="mobile"]').or(page.locator('input[placeholder*="phone"]')))).toBeVisible()
    }
  })

  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForURL(/\/login/, { timeout: 10000 })
  })
})
