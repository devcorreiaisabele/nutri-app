import { expect, Page, test } from '@playwright/test';

const ESPERA = 180000;
const TITULO_MODAL = 'Qual o seu novo objetivo?';
test.describe.configure({ mode: 'serial' });

test.describe('Fluxo de Mais Detalhes (objetivo de saúde)', () => {
  test.setTimeout(600000);

  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('http://localhost:8081/MaisDetalhes', {
      timeout: ESPERA,
      waitUntil: 'domcontentloaded',
    });
    await expect(page.getByText('Resumo Nutricional')).toBeVisible({ timeout: ESPERA });
  });

  test.afterAll(async () => {
    await page.close();
  });


  test.beforeEach(async () => {
    if (await page.getByText(TITULO_MODAL).isVisible()) {
      await page.mouse.click(100, 80);
      await expect(page.getByText(TITULO_MODAL)).toBeHidden();
    }
  });

  test('Estado inicial - mostra o resumo nutricional e o objetivo de saúde', async () => {
    await expect(page.getByText('Mais Detalhes')).toBeVisible();
    await expect(page.getByText('Resumo Nutricional')).toBeVisible();
    await expect(page.getByText('Tipo de Dieta')).toBeVisible();
    await expect(page.getByText('Restrição Religiosa')).toBeVisible();
    await expect(page.getByText('Alergias')).toBeVisible();
    await expect(page.getByText('Objetivo de Saúde')).toBeVisible();
    await expect(page.getByText('Meta Selecionada')).toBeVisible();
    await expect(page.getByText('METAS DIÁRIAS CALCULADAS')).toBeVisible();
  });

  test('Clicar em Alterar abre o modal com as 3 opções de meta', async () => {
    await page.getByText('Alterar', { exact: true }).click();

    await expect(page.getByText(TITULO_MODAL)).toBeVisible();
    await expect(page.getByText('Foco em déficit calórico leve')).toBeVisible();
    await expect(page.getByText('Equilíbrio para o dia a dia')).toBeVisible();
    await expect(page.getByText('Aumento de calorias e proteínas')).toBeVisible();
    await expect(page.getByText('Salvar Alteração')).toBeVisible();
  });

  test('Cenário Positivo - Escolher Ganho de Massa e salvar atualiza a meta', async () => {
    await page.getByText('Alterar', { exact: true }).click();
    await expect(page.getByText(TITULO_MODAL)).toBeVisible();

    await page.getByText('Aumento de calorias e proteínas').click();
    await page.getByText('Salvar Alteração').click();

    await expect(page.getByText(TITULO_MODAL)).toBeHidden();
    await expect(page.getByText('Ganho de Massa')).toBeVisible();
  });

  test('Cenário Negativo - Escolher outra meta e fechar sem salvar não altera a meta', async () => {
    await page.getByText('Alterar', { exact: true }).click();
    await expect(page.getByText(TITULO_MODAL)).toBeVisible();

    await page.getByText('Equilíbrio para o dia a dia').click();
    await page.mouse.click(100, 80); 

    await expect(page.getByText(TITULO_MODAL)).toBeHidden();
    await expect(page.getByText('Ganho de Massa')).toBeVisible();
    await expect(page.getByText('Manutenção de Peso')).toBeHidden();
  });
});