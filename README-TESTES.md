# Testes Automatizados (Playwright) — Nutri+

Este documento descreve como configurar, executar e analisar os testes automatizados ponta a ponta (E2E) do aplicativo **Nutri+**, desenvolvidos com **Playwright** e **TypeScript** na pasta `tests/`.

## 1. Instalação e Preparação

Certifique-se de que as dependências do projeto já estejam instaladas (`npm install`). Caso execute o Playwright pela primeira vez na máquina, instale os navegadores necessários:

```bash
npx playwright install