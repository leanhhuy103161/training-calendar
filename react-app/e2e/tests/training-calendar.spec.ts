import { test, expect } from '@playwright/test'

test.describe('Training Calendar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('renders the calendar region', async ({ page }) => {
    await expect(page.getByRole('region', { name: 'Training calendar' })).toBeVisible()
  })

  test('renders all 7 day columns', async ({ page }) => {
    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
    for (const day of days) {
      await expect(page.getByText(day)).toBeVisible()
    }
  })

  test('renders workouts in the correct day columns', async ({ page }) => {
    await expect(page.getByRole('group', { name: /Workout: Chest day/i })).toBeVisible()
    await expect(page.getByRole('group', { name: /Workout: Leg DaY/i })).toBeVisible()
    await expect(page.getByRole('group', { name: /Workout: Arm day/i })).toBeVisible()
  })

  test('renders exercises inside workout cards', async ({ page }) => {
    await expect(page.getByRole('listitem', { name: /Exercise: Bench Press/i })).toBeVisible()
  })

  test('renders add workout button for each day', async ({ page }) => {
    const addWorkoutButtons = page.getByRole('button', { name: /Add workout to/i })
    await expect(addWorkoutButtons).toHaveCount(7)
  })

  test('renders add exercise button inside each workout card', async ({ page }) => {
    const addExerciseButtons = page.getByRole('button', { name: 'Add exercise' })
    await expect(addExerciseButtons).toHaveCount(3)
  })

  test('workout card has workout options button', async ({ page }) => {
    const optionButtons = page.getByRole('button', { name: 'Workout options' })
    await expect(optionButtons).toHaveCount(3)
  })

  test('exercises display set count and weight info', async ({ page }) => {
    await expect(page.getByText('3x')).toBeVisible()
    await expect(page.getByText('50 lb x 5, 60 lb x 5, 70 l...')).toBeVisible()
  })

  test('today date is visually distinct', async ({ page }) => {
    // FRI (date 9) is marked as isToday in mock data
    const fridayDate = page.locator('.text-workout-title.font-bold', { hasText: '9' })
    await expect(fridayDate).toBeVisible()
  })
})
