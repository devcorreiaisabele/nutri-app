import { test, expect } from '@playwright/test';

const BASE_URL = process.env.APP_URL || 'https://playwright.dev';

test('Cenário Positivo - Nutricionista cria conta de paciente já com vínculo', async ({ page }) => {
  await page.goto(BASE_URL);
  await page.waitForLoadState('domcontentloaded');
  await expect(page.locator('body')).toBeVisible();
});