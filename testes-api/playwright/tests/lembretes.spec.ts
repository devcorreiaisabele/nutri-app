import { expect, test } from '@playwright/test';

const ESPERA = 180000; // 3 minutos para o app carregar

test.describe('Fluxo de Lembretes', () => {
  test.setTimeout(600000);

  // Sem login: abre direto a tela de Lembretes
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8081/Lembretes', { timeout: ESPERA });
    await expect(page.getByText('Suas refeições')).toBeVisible({ timeout: ESPERA });
  });

  test('Cenário Positivo - Ativar lembrete de refeição', async ({ page }) => {
    await expect(page.getByText('Nenhum lembrete ativo')).toBeVisible();

    await page.getByRole('switch').first().check();

    await expect(page.getByText('Lembrete ativo').first()).toBeVisible({ timeout: ESPERA });
    await expect(page.getByText('1 lembrete ativo')).toBeVisible();
  });

  test('Cenário Negativo - Desativar lembrete e manter estado desativado', async ({ page }) => {
    const primeiroSwitch = page.getByRole('switch').first();

    await primeiroSwitch.check();
    await expect(page.getByText('Lembrete ativo').first()).toBeVisible({ timeout: ESPERA });

    await primeiroSwitch.uncheck();

    await expect(page.getByText('Desativado').first()).toBeVisible({ timeout: ESPERA });
    await expect(page.getByText('Nenhum lembrete ativo')).toBeVisible();
  });

  test('Ajustar horário do café da manhã em +1 minuto', async ({ page }) => {
    await expect(page.getByText('07:00')).toBeVisible();

    await page.getByText('+').first().click();

    await expect(page.getByText('07:01')).toBeVisible({ timeout: ESPERA });
  });
});