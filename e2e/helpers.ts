import { Page } from '@playwright/test'

/**
 * Shared login helper for E2E tests.
 * Handles the CSS animation delay on the login page.
 */
export async function login(page: Page, email = 'priya@example.com', password = 'Test@123') {
  await page.goto('/login')
  
  // Wait for the login form to become visible (CSS animation may delay it)
  await page.waitForSelector('input[type="email"]', { state: 'visible', timeout: 15000 })
  
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')
  
  // Wait for redirect to dashboard or onboarding
  await page.waitForURL(/\/(dashboard|onboarding|profile|search)/, { timeout: 15000 })
}

/**
 * Login via API and get auth token (faster, bypasses UI animation)
 */
export async function getAuthToken(baseURL: string, email = 'priya@example.com', password = 'Test@123'): Promise<string> {
  const response = await fetch(`${baseURL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  
  if (!response.ok) {
    throw new Error(`Login failed: ${response.status}`)
  }
  
  const data = await response.json()
  return data.token
}
