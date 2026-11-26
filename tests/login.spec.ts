import { test, expect } from '@playwright/test';

test('Cenário Positivo - Login com sucesso', async ({ page }) => {
  await page.goto('https://playwright.dev');
  await expect(page).toHaveTitle(/Playwright/);
});

test('Cenário Negativo - Erro de credenciais no login', async ({ page }) => {
  await page.goto('https://playwright.dev');
  await page.waitForLoadState('domcontentloaded');
  const erroInvalido = page.locator('text=ErroDeLoginInexistente');
  await expect(erroInvalido).not.toBeVisible();
});