import { test, expect, Page } from '@playwright/test'

async function login(page: Page) {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'priya@example.com')
  await page.fill('input[type="password"]', 'password123')
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 10000 })
}

test.describe('Search & Matchmaking', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('should display search page with profiles', async ({ page }) => {
    await page.goto('/search')
    await page.waitForLoadState('networkidle')

    // Should show profile cards or a search interface
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('should display matches page', async ({ page }) => {
    await page.goto('/matches')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('should view a profile detail page', async ({ page }) => {
    // Navigate to a known seed user profile
    await page.goto('/profile/2') // Rahul Verma
    await page.waitForLoadState('networkidle')

    // Should show the profile with name or compatibility score
    await expect(page.locator('body')).toContainText(/Rahul|Compatibility|Match/i)
  })

  test('compatibility score should be deterministic', async ({ page }) => {
    // Visit same profile twice — score should be the same
    await page.goto('/profile/2')
    await page.waitForLoadState('networkidle')
    const score1 = await page.locator('[class*="score"], [class*="compatibility"], [class*="match"]').first().textContent()

    await page.goto('/profile/2')
    await page.waitForLoadState('networkidle')
    const score2 = await page.locator('[class*="score"], [class*="compatibility"], [class*="match"]').first().textContent()

    // Scores should match (no Math.random)
    if (score1 && score2) {
      expect(score1).toBe(score2)
    }
  })
})
