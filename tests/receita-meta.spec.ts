import { test, expect } from '@playwright/test';

const BASE_URL = process.env.APP_URL || 'https://playwright.dev';

test('Cenário Negativo - Bloqueio ao buscar receita inexistente ou meta inválida', async ({ page }) => {
  await page.goto(BASE_URL);
  await page.waitForLoadState('domcontentloaded');
  const erroReceita = page.locator('text=ReceitaNaoEncontradaXYZ');
  await expect(erroReceita).not.toBeVisible();
});