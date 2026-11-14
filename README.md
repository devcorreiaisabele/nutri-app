# Nutri+ — Sua vida mais saudável

O **Nutri+** é um aplicativo mobile focado em nutrição, gestão de saúde, acompanhamento de macronutrientes, planejamento de refeições e conexão direta entre pacientes e profissionais da área da nutrição.

## Sumário

- [Funcionalidades](#funcionalidades)
- [Painel Profissional (Nutricionista)](#painel-profissional-nutricionista)
- [Tecnologias](#tecnologias)
- [Como executar](#como-executar)
- [Equipe de desenvolvimento](#equipe-de-desenvolvimento)

## Funcionalidades

### 1. Autenticação

- Tela de login (**Entrar**) com acesso por e-mail e senha.

### 2. Tela Inicial (Home / Receitas e Alimentação)

- Seção de boas-vindas personalizada para o usuário.
- Barra de busca de receitas.
- Lista de receitas recomendadas categorizadas por tags (ex.: Vegano, Vegetariano, Proteico), exibindo tempo de preparo e calorias.
- Exemplos de receitas: Panqueca de Aveia e Banana, Omelete, Strogonoff de Grão-de-Bico, Salada Nutri Quinoa e Wrap de Frango.

### 3. Detalhes da Receita e Painel Nutricional

- Visualização detalhada da receita selecionada.
- Lista de ingredientes e passo a passo do modo de preparo.
- Informações nutricionais detalhadas (proteínas, ferro, vitamina B12, entre outras).

### 4. Dashboard — Calorias e Macronutrientes

- Resumo diário de consumo calórico e gasto energético estimado.
- Acompanhamento de metas de peso (peso atual vs. peso alvo).
- Refeições escolhidas organizadas por horários (Café da Manhã, Lanche, etc.).

### 5. Registro de Peso e Gasto Energético

- Registro de peso diário e histórico recente.
- Cálculo detalhado do gasto energético:
  - Taxa Metabólica Basal (TMB)
  - Gasto Energético Total Diário (GET)
  - Déficit ou superávit calórico, com base na fórmula de Mifflin-St Jeor
- Inserção de dados corporais: idade, peso, altura e gênero.

### 6. Preferências e Restrições Alimentares (Onboarding / Configuração)

- Tipo de dieta: Onívora, Vegana, Vegetariana ou Pescatariana.
- Restrições adicionais religiosas ou culturais: Halal, Kosher, Cristianismo e Hinduísmo.
- Alergias e intolerâncias: Sem Glúten, Sem Lactose, Amendoim, Nozes, entre outras.

### 7. Definição e Mudança de Metas

- Objetivos disponíveis: **Perder peso**, **Manter o peso** ou **Ganhar massa muscular**.
- Definição do peso desejado.

### 8. Conquistas e Evolução

- Histórico de registros de evolução.
- Selos de metas atingidas, como marcos de peso alcançados, com suas respectivas datas.

## Painel Profissional (Nutricionista)

- **Perfil do nutricionista:** informações da conta, número de registro profissional (CRN e UF), especialidade e biografia.
- **Visão geral profissional:** métricas de pacientes ativos, metas atingidas pelos pacientes, lembretes pendentes e solicitações de vínculo.
- **Gestão de pacientes:** lista e gerenciamento dos pacientes conectados ao profissional.

## Tecnologias

- React Native (Expo)
- TypeScript
- Expo Router
- Axios

## Como executar

### Pré-requisitos

- Node.js
- npm ou yarn
- Expo CLI

### Instalação

```bash
git clone <url-do-repositorio>
cd <pasta-do-projeto>
npm install
npx expo start
```

## Equipe de desenvolvimento

| Nome | Função |
| --- | --- |
| Aldieres Pinheiro da Costa Filho | Front-end |
| Caio Vinícius Araújo De Lima | Front-end |
| Caio Vinícius de Góis Macedo | Banco de dados e Back-end |
| Isabele Correia dos Santos | Front-end |
| Pedro Marcos de Lima Macedo | Banco de dados e Back-end |
