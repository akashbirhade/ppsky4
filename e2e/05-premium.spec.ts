import { test, expect, Page } from '@playwright/test'

async function login(page: Page) {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'priya@example.com')
  await page.fill('input[type="password"]', 'password123')
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 10000 })
}

test.describe('Premium & Checkout', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('should display premium plans page', async ({ page }) => {
    await page.goto('/premium')
    await page.waitForLoadState('networkidle')

    // Should show pricing tiers
    await expect(page.locator('text=Silver').or(page.locator('text=Gold').or(page.locator('text=Platinum')))).toBeVisible({ timeout: 10000 })
  })

  test('should validate coupon via API', async ({ page }) => {
    const response = await page.request.post('/api/coupon', {
      data: { code: 'SHADI50', plan: 'gold' },
    })

    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    expect(data.valid).toBe(true)
    expect(data.discount).toBe(50)
  })

  test('should reject invalid coupon', async ({ page }) => {
    const response = await page.request.post('/api/coupon', {
      data: { code: 'INVALIDCODE', plan: 'gold' },
    })

    const data = await response.json()
    expect(data.valid).toBe(false)
  })
})
