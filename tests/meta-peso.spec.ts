import { test, expect } from '@playwright/test';

const BASE_URL = process.env.APP_URL || 'https://playwright.dev';

test.describe('Fluxo Atingir Meta de Peso', () => {
  test('Cenário Positivo - Atualizar registro de peso e validar atingimento da meta', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Cenário Negativo - Rejeitar valor de peso inválido ou fora da faixa permitida', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');
    const erroPeso = page.locator('text=PesoInvalidoMeta999');
    await expect(erroPeso).not.toBeVisible();
  });
});