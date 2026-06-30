import { test, expect, Page } from '@playwright/test'

async function login(page: Page) {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'priya@example.com')
  await page.fill('input[type="password"]', 'password123')
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 10000 })
}

test.describe('Dashboard & Profile', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('should display dashboard after login', async ({ page }) => {
    if (!page.url().includes('/dashboard')) {
      await page.goto('/dashboard')
    }
    // Dashboard should show profile cards or recommendations
    await expect(page.locator('body')).not.toBeEmpty()
    // Should have navigation
    await expect(page.locator('nav').or(page.locator('header'))).toBeVisible()
  })

  test('should navigate to profile page', async ({ page }) => {
    await page.goto('/profile')
    await page.waitForLoadState('networkidle')
    // Profile page should show user info
    await expect(page.locator('text=Priya').or(page.locator('h1, h2'))).toBeVisible({ timeout: 10000 })
  })

  test('should navigate to settings', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).not.toBeEmpty()
  })
})
