import { test, expect } from '@playwright/test';

const BASE_URL = process.env.APP_URL || 'https://playwright.dev';

test('Cenário Não Funcional - Tempo de carregamento em tela de celular', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  const inicio = Date.now();
  await page.goto(BASE_URL);
  await page.waitForLoadState('domcontentloaded');
  const tempoCarregamento = Date.now() - inicio;

  await expect(page.locator('body')).toBeVisible();
  expect(tempoCarregamento).toBeLessThan(10000);
});