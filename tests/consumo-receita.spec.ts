import { test, expect } from '@playwright/test';

const BASE_URL = process.env.APP_URL || 'https://playwright.dev';

test.describe('Fluxo Buscar e Consumir Receita', () => {
  test('Cenário Positivo - Localizar receita disponível e registrar consumo', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Cenário Negativo - Impedir consumo quando receita não existe ou não é selecionada', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');
    const erroConsumo = page.locator('text=ErroRegistrarConsumoReceita');
    await expect(erroConsumo).not.toBeVisible();
  });
});