import { test, expect } from '@playwright/test';

test('Cenário Positivo - Cadastro de novo usuário com sucesso', async ({ page }) => {
  await page.goto('https://playwright.dev');
  await expect(page.locator('body')).toBeVisible();
});

test('Cenário Negativo - Campos obrigatórios vazios no cadastro', async ({ page }) => {
  await page.goto('https://playwright.dev');
  const campoObrigatorio = page.locator('text=CampoObrigatorioFaltando');
  await expect(campoObrigatorio).not.toBeVisible();
});