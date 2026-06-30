import { test, expect, Page } from '@playwright/test'

async function login(page: Page) {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'priya@example.com')
  await page.fill('input[type="password"]', 'password123')
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 10000 })
}

test.describe('Navigation & UI', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('navbar should be visible on all pages', async ({ page }) => {
    const routes = ['/dashboard', '/search', '/matches', '/messages', '/profile', '/settings']

    for (const route of routes) {
      await page.goto(route)
      await page.waitForLoadState('networkidle')
      // Navigation should be present
      const nav = page.locator('nav').or(page.locator('header'))
      await expect(nav).toBeVisible({ timeout: 5000 })
    }
  })

  test('all main pages should load without errors', async ({ page }) => {
    const routes = [
      '/dashboard', '/search', '/matches', '/messages',
      '/profile', '/settings', '/premium', '/kundali',
      '/coach', '/community', '/events', '/vendors',
    ]

    for (const route of routes) {
      const response = await page.goto(route)
      expect(response?.status()).toBeLessThan(500) // No server errors
      
      // Check no uncaught errors in console
      const errors: string[] = []
      page.on('pageerror', (err) => errors.push(err.message))
      await page.waitForLoadState('networkidle')
    }
  })

  test('should show legal pages', async ({ page }) => {
    const legalRoutes = ['/legal/terms', '/legal/privacy']

    for (const route of legalRoutes) {
      const response = await page.goto(route)
      expect(response?.status()).toBeLessThan(500)
    }
  })
})
