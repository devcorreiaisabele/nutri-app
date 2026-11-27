import { expect, Page, test } from '@playwright/test';

const ESPERA = 180000;
const CAMPO = /Buscar receitas ideais para o/;
test.describe.configure({ mode: 'serial' });

test.describe('Fluxo de Escolher Receita', () => {
  test.setTimeout(600000);

  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('http://localhost:8081/EscolherReceita?refeicao=Almo%C3%A7o', {
      timeout: ESPERA,
      waitUntil: 'domcontentloaded',
    });
    await expect(page.getByPlaceholder(CAMPO)).toBeVisible({ timeout: ESPERA });
  });

  test.afterAll(async () => {
    await page.close();
  });

  // Antes de cada teste, limpa o campo (sem recarregar a página)
  test.beforeEach(async () => {
    await page.getByPlaceholder(CAMPO).fill('');
  });

  test('Estado inicial - mostra o título da refeição e a lista de recomendadas', async () => {
    await expect(page.getByText('Sugestões para Almoço')).toBeVisible();
    await expect(page.getByPlaceholder('Buscar receitas ideais para o almoço...')).toBeVisible();
    await expect(page.getByText('Recomendadas para você')).toBeVisible();
    // Espera as receitas virem do banco
    await expect(page.getByText('Feijoada Light')).toBeVisible({ timeout: ESPERA });
  });

  test('Cenário Positivo - Buscar pelo nome mostra a receita e esconde as outras', async () => {
    await expect(page.getByText('Moqueca de Peixe')).toBeVisible({ timeout: ESPERA });

    await page.getByPlaceholder(CAMPO).fill('Feijoada');

    await expect(page.getByText('Feijoada Light')).toBeVisible({ timeout: ESPERA });
    await expect(page.getByText('Moqueca de Peixe')).toBeHidden();
  });

  test('Cenário Positivo - Busca ignora acento e maiúsculas (baiao -> Baião de Dois)', async () => {
    await page.getByPlaceholder(CAMPO).fill('baiao');

    await expect(page.getByText('Baião de Dois')).toBeVisible({ timeout: ESPERA });
  });

  test('Cenário Negativo - Nome que não existe não mostra nenhuma receita', async () => {
    // Confirma que as receitas já carregaram antes de buscar
    await expect(page.getByText('Feijoada Light')).toBeVisible({ timeout: ESPERA });

    await page.getByPlaceholder(CAMPO).fill('xyzqwk123');

    await expect(page.getByText('Feijoada Light')).toBeHidden();
    await expect(page.getByText('Baião de Dois')).toBeHidden();
    await expect(page.getByText('Moqueca de Peixe')).toBeHidden();
  });
});
