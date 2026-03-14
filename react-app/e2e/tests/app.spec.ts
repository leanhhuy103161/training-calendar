import { test, expect } from '@playwright/test'

test.describe('App smoke tests', () => {
  test('renders root element', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('#root')).toBeVisible()
  })

  test('has no console errors on load', async ({ page }) => {
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await page.goto('/')
    expect(errors).toHaveLength(0)
  })
})
