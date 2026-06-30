import { test, expect, Page } from '@playwright/test'

async function login(page: Page) {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'priya@example.com')
  await page.fill('input[type="password"]', 'password123')
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 10000 })
}

test.describe('Kundali Matching', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('should display kundali page', async ({ page }) => {
    await page.goto('/kundali')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).toContainText(/Kundali|Horoscope|Guna/i)
  })

  test('kundali API should return deterministic score', async ({ page }) => {
    // Same pair should always get the same score
    const res1 = await page.request.get('/api/activity/kundali?userId=1&targetId=2')
    const data1 = await res1.json()

    const res2 = await page.request.get('/api/activity/kundali?userId=1&targetId=2')
    const data2 = await res2.json()

    expect(data1.gunaScore).toBe(data2.gunaScore)
    expect(data1.score).toBe(data2.score)
    expect(data1.gunaScore).toBeGreaterThanOrEqual(18)
    expect(data1.gunaScore).toBeLessThanOrEqual(36)
  })
})
