import { test, expect } from '@playwright/test';

test('Cenário Positivo - Carregar página com sucesso', async ({ page }) => {
  // Acessa uma página web estável para garantir que o teste passe
  await page.goto('https://playwright.dev');

  // Verifica se o título da página contém a palavra Playwright
  await expect(page).toHaveTitle(/Playwright/);
});

test('Cenário Negativo - Validação de elemento ausente', async ({ page }) => {
  await page.goto('https://playwright.dev');

  // Verifica que um texto inexistente não está visível na tela
  const elementoInexistente = page.locator('text=TextoFalsificadoXYZ123');
  await expect(elementoInexistente).not.toBeVisible();
});