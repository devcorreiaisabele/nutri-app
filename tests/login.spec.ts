import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

const BASE_URL = process.env.APP_URL || 'https://playwright.dev';

test.describe('Fluxo de Login com Page Object', () => {
  test('Cenário Positivo - Acesso com credenciais válidas via LoginPage', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto(BASE_URL);
    await loginPage.expectPageLoaded();
    await loginPage.login('paciente.teste@nutriplus.com', 'SenhaValida123');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Cenário Negativo - Tentativa de login com credenciais inválidas via LoginPage', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto(BASE_URL);
    await loginPage.expectPageLoaded();
    await loginPage.login('email.invalido@nutriplus.com', 'SenhaErrada000');
    await loginPage.expectNoUnexpectedError();
  });
});