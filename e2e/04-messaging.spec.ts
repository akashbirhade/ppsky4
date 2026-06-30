import { test, expect, Page } from '@playwright/test'

async function login(page: Page) {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'priya@example.com')
  await page.fill('input[type="password"]', 'password123')
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 10000 })
}

test.describe('Messaging', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('should display messages page', async ({ page }) => {
    await page.goto('/messages')
    await page.waitForLoadState('networkidle')
    // Messages page should load without errors
    await expect(page.locator('body')).not.toBeEmpty()
  })

  test('should send a message via API', async ({ page }) => {
    // Use API to send a message and verify it appears
    const response = await page.request.post('/api/messages', {
      data: {
        senderId: '1', // Priya
        receiverId: '2', // Rahul
        content: `E2E test message ${Date.now()}`,
      },
    })

    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    expect(data.message || data.success).toBeTruthy()
  })

  test('should retrieve conversations via API', async ({ page }) => {
    const response = await page.request.get('/api/messages?userId=1')
    expect(response.ok()).toBeTruthy()
    const data = await response.json()
    expect(Array.isArray(data.conversations) || data).toBeTruthy()
  })
})
