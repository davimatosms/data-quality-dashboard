# Plano de Execução: Data Quality Dashboard

**Data**: 2026-10-07 | **Especificação**: [frontend-plan.md](./frontend-plan.md)

## Resumo

Construir o dashboard web `data-quality-dashboard` como uma SPA React com
TypeScript e Vite. O frontend consumirá exclusivamente a API HTTP do
repositório `data-quality-api`, apresentando o estado das fontes, detalhes dos
checks e operações de cadastro, edição e exclusão. O ETL permanecerá
independente e será usado apenas para produzir checks reais durante a
integração local.

O desenvolvimento será incremental: primeiro a fundação do projeto e o
contrato tipado, depois o dashboard, detalhes, CRUD e, por fim, testes,
responsividade, Docker e validação integrada.

## Requisitos rastreáveis

Os requisitos abaixo foram derivados do plano funcional e de seus critérios de
aceite:

- **REQ-001**: Listar fontes reais da API no dashboard.
- **REQ-002**: Exibir os estados `FRESH`, `STALE`, `UNKNOWN`, `PASSING` e
  `FAILING` com texto e indicação visual acessível.
- **REQ-003**: Filtrar fontes por freshness e qualidade e atualizar os dados
  manualmente ou automaticamente.
- **REQ-004**: Exibir detalhes da fonte, métricas, regras, mensagens de falha e
  histórico dos últimos checks.
- **REQ-005**: Cadastrar, editar e excluir fontes pela API.
- **REQ-006**: Apresentar loading, estado vazio e erros de API de forma clara.
- **REQ-007**: Funcionar em desktop e telas menores, sem depender apenas de
  cores para comunicar estados.
- **REQ-008**: Ter testes para cliente HTTP, estados visuais e formulários.
- **REQ-009**: Rodar em produção via Docker e Nginx.
- **REQ-010**: Documentar a arquitetura e a execução dos três projetos,
  mantendo o frontend sem acesso direto ao banco.

## Contexto técnico

**Linguagem/versão**: TypeScript, com React e Vite.

**Dependências principais**: React, React Router, cliente HTTP baseado em
`fetch`, Vitest, Testing Library e configuração de lint.

**Persistência**: Nenhuma no frontend. Todos os dados vêm da API.

**API consumida**:

```text
GET    /health
GET    /sources
POST   /sources
PUT    /sources/{id}
DELETE /sources/{id}
GET    /sources/{id}/status
POST   /sources/{id}/checks
```

**Testes**: Vitest e Testing Library; mocks do `fetch` para testes unitários e
de componentes. A validação integrada usará a API real quando os serviços
locais estiverem disponíveis.

**Plataforma alvo**: navegador moderno em desktop e mobile; produção em
container Nginx.

**Restrições**:

- não duplicar regras de qualidade do ETL;
- não acessar PostgreSQL diretamente;
- não depender de campos internos dos modelos da API;
- manter `VITE_API_URL` configurável;
- preservar os estados e nomes definidos no contrato da API;
- autenticação, alertas, gráficos avançados, paginação e Azure ficam fora do
  MVP.

## Verificação de princípios

- **Separação de responsabilidades**: aprovado. O dashboard é cliente visual;
  ETL e API mantêm suas responsabilidades atuais.
- **Contrato explícito**: aprovado. Tipos TypeScript representarão os schemas
  públicos da API.
- **Falhas visíveis**: aprovado. Erros de rede e respostas HTTP inválidas serão
  expostos na interface e nos testes.
- **Acessibilidade e responsividade**: aprovado. Badges terão texto, foco
  visível, semântica adequada e layout adaptável.
- **Testabilidade**: aprovado. Serviços, componentes e formulários serão
  testados isoladamente.

## Diretrizes aplicadas

- Centralizar chamadas HTTP em `src/api/client.ts`, evitando `fetch`
  espalhado pelos componentes.
- Manter tipos de domínio em `src/types/api.ts`, alinhados aos schemas públicos.
- Representar estados desconhecidos explicitamente, sem converter ausência de
  check em sucesso ou falha.
- Usar componentes reutilizáveis para badges, cards, tabelas, mensagens e
  estados de carregamento.
- Configurar o Nginx para fallback de rotas SPA e encaminhamento correto de
  arquivos estáticos.

## Etapas de implementação

### Fase 1 — Setup

#### P1.1 Inicializar a aplicação React/Vite

- **Requisitos**: REQ-007, REQ-009, REQ-010
- **Descrição**: Criar o projeto `data-quality-dashboard` com TypeScript,
  Vite, React Router, scripts de desenvolvimento, build, lint e testes.
  Definir a convenção de diretórios e a variável `VITE_API_URL`.

#### P1.2 Definir a base visual e o shell da aplicação

- **Requisitos**: REQ-007
- **Descrição**: Criar layout responsivo, navegação principal, container de
  conteúdo, tipografia, tokens de espaçamento/cores e estilos base. O shell
  deve funcionar nas rotas de dashboard, detalhes e formulário.

### Fase 2 — Fundação

#### P2.1 Modelar o contrato público da API

- **Requisitos**: REQ-001, REQ-002, REQ-004, REQ-005
- **Descrição**: Definir tipos para `Source`, `Check`, `RuleResult`, `Metrics`,
  status de freshness/qualidade, payloads de criação/edição e respostas de
  status. Usar os exemplos e schemas expostos pela API como referência.

#### P2.2 Implementar cliente HTTP e serviços de fontes

- **Requisitos**: REQ-001, REQ-004, REQ-005, REQ-006
- **Descrição**: Implementar cliente HTTP configurável, tratamento de status
  não-2xx, mensagens de erro e funções para health, listagem, CRUD, status e
  envio de checks. Nenhum componente deverá montar URLs ou acessar `fetch`
  diretamente.

#### P2.3 Criar componentes de estado reutilizáveis

- **Requisitos**: REQ-002, REQ-006, REQ-007
- **Descrição**: Implementar `StatusBadge`, `SummaryCard`, indicadores de
  carregamento, estado vazio, erro e confirmação de ação destrutiva.

### Fase 3 — História US1: Dashboard geral (P1)

#### P3.1 Implementar resumo e tabela de fontes

- **Requisitos**: REQ-001, REQ-002
- **Descrição**: Buscar fontes reais, exibir cards de totais e uma tabela com
  nome, freshness, qualidade, frequência, último check e link para detalhes.
  Tratar lista vazia, loading e erro.

#### P3.2 Implementar filtros e atualização

- **Requisitos**: REQ-003
- **Descrição**: Adicionar filtros por freshness e qualidade, botão de
  atualização manual e atualização automática configurável sem criar
  requisições concorrentes desnecessárias.

### Fase 4 — História US2: Detalhes e histórico (P1)

#### P4.1 Implementar página de detalhes da fonte

- **Requisitos**: REQ-004
- **Descrição**: Buscar `/sources/{id}/status` e exibir descrição, estados
  atuais, frequência, tolerância, métricas, resultados por regra, mensagens de
  falha, timestamps e os últimos checks.

#### P4.2 Implementar estados de navegação e dados ausentes

- **Requisitos**: REQ-004, REQ-006, REQ-007
- **Descrição**: Tratar ID inválido, fonte removida, ausência de histórico,
  falhas de API e retorno à lista, mantendo a informação compreensível em
  telas pequenas.

### Fase 5 — História US3: Cadastro, edição e exclusão (P1)

#### P5.1 Implementar formulário de fonte

- **Requisitos**: REQ-005, REQ-006
- **Descrição**: Criar formulário reutilizável para `/sources/new` e
  `/sources/:id/edit`, com validação de nome, frequência, tolerância e regras,
  preenchimento no modo edição, estados de envio e mensagens de erro.

#### P5.2 Conectar operações de criação e atualização

- **Requisitos**: REQ-005
- **Descrição**: Integrar `POST /sources` e `PUT /sources/{id}`, impedir envio
  duplicado, mostrar confirmação de sucesso e redirecionar para a lista ou
  detalhes apropriados.

#### P5.3 Conectar exclusão com confirmação

- **Requisitos**: REQ-005, REQ-006
- **Descrição**: Adicionar ação de exclusão na tabela ou detalhes, confirmação
  explícita, tratamento de erro e atualização do dashboard após sucesso.

### Fase 6 — Qualidade, integração e entrega

#### P6.1 Adicionar cobertura de testes

- **Requisitos**: REQ-008
- **Descrição**: Testar cliente HTTP e erros, badges e cards para todos os
  estados, dashboard com loading/erro/vazio/filtros, detalhes e fluxos de
  criação/edição/exclusão.

#### P6.2 Configurar Docker e Nginx

- **Requisitos**: REQ-009
- **Descrição**: Criar Dockerfile multi-stage, imagem de runtime Nginx,
  configuração de fallback para React Router e documentação do build/run.

#### P6.3 Validar integração com API e ETL

- **Requisitos**: REQ-001, REQ-004, REQ-005, REQ-010
- **Descrição**: Executar API, criar ou importar uma fonte, rodar o ETL de
  demonstração, verificar a chegada do check no dashboard e confirmar que o
  frontend não acessa o banco.

#### P6.4 Documentar operação e arquitetura

- **Requisitos**: REQ-010
- **Descrição**: Criar README com pré-requisitos, `VITE_API_URL`, comandos
  locais, testes, Docker, fluxo ETL → API → Dashboard, troubleshooting de CORS
  e limites do MVP.

## Quebra de tarefas

### Fase 1 — Setup

- [ ] T001 [P] [Plan:1.1] Inicializar o projeto React/Vite TypeScript com `package.json`, `tsconfig` e scripts de desenvolvimento, build, lint e teste.
- [ ] T002 [P] [Plan:1.1] Criar `.env.example` com `VITE_API_URL` e definir o carregamento de configuração em `src/config.ts`.
- [ ] T003 [P] [Plan:1.2] Criar `src/App.tsx`, `src/main.tsx` e a configuração inicial das rotas com React Router.
- [ ] T004 [P] [Plan:1.2] Criar estilos base responsivos em `src/styles/global.css` e o shell em `src/components/AppLayout.tsx`.

### Fase 2 — Fundação

- [ ] T005 [P] [Plan:2.1] Definir enums, interfaces e payloads públicos em `src/types/api.ts`.
- [ ] T006 [Plan:2.2] Implementar `src/api/client.ts` com URL base, headers, parsing de respostas e erros HTTP explícitos.
- [ ] T007 [Plan:2.2] Implementar operações de fontes em `src/api/sources.ts` para health, listagem, CRUD, status e checks.
- [ ] T008 [P] [Plan:2.3] Criar `src/components/StatusBadge.tsx` com texto e variações de freshness e qualidade.
- [ ] T009 [P] [Plan:2.3] Criar `src/components/SummaryCard.tsx`, `LoadingState.tsx`, `EmptyState.tsx` e `ErrorState.tsx`.

### Fase 3 — Dashboard geral

- [ ] T010 [US1] [Plan:3.1] Implementar `src/pages/DashboardPage.tsx` com carregamento, resumo, tabela e links para detalhes/edição.
- [ ] T011 [P] [US1] [Plan:3.1] Implementar `src/components/SourceTable.tsx` com colunas, badges e ações de fonte.
- [ ] T012 [US1] [Plan:3.2] Implementar filtros e atualização manual/automática em `src/pages/DashboardPage.tsx`.

### Fase 4 — Detalhes e histórico

- [ ] T013 [US2] [Plan:4.1] Implementar `src/pages/SourceDetailsPage.tsx` consumindo o endpoint de status.
- [ ] T014 [P] [US2] [Plan:4.1] Criar componentes `src/components/CheckHistory.tsx`, `RuleResults.tsx` e `MetricsPanel.tsx`.
- [ ] T015 [US2] [Plan:4.2] Tratar loading, erro, fonte inexistente, histórico vazio e navegação de retorno na página de detalhes.

### Fase 5 — Cadastro, edição e exclusão

- [ ] T016 [US3] [Plan:5.1] Criar `src/pages/SourceFormPage.tsx` com modo novo/edição, validação e campos do contrato.
- [ ] T017 [US3] [Plan:5.2] Integrar `POST /sources` e `PUT /sources/{id}` com feedback, bloqueio de reenvio e redirecionamento.
- [ ] T018 [US3] [Plan:5.3] Adicionar confirmação e integração de `DELETE /sources/{id}` em `SourceTable.tsx` ou `SourceDetailsPage.tsx`.

### Fase 6 — Qualidade, integração e entrega

- [ ] T019 [P] [Plan:6.1] Criar mocks e testes do cliente HTTP em `src/api/__tests__/client.test.ts` e `src/api/__tests__/sources.test.ts`.
- [ ] T020 [P] [Plan:6.1] Criar testes de badges, cards e estados em `src/components/__tests__/StatusBadge.test.tsx` e `src/components/__tests__/states.test.tsx`.
- [ ] T021 [P] [Plan:6.1] Criar testes do dashboard, detalhes e filtros em `src/pages/__tests__/DashboardPage.test.tsx` e `SourceDetailsPage.test.tsx`.
- [ ] T022 [P] [Plan:6.1] Criar testes do formulário e operações CRUD em `src/pages/__tests__/SourceFormPage.test.tsx`.
- [ ] T023 [P] [Plan:6.2] Criar `Dockerfile` multi-stage, `nginx.conf` com fallback SPA e ajustar scripts de build.
- [ ] T024 [Plan:6.3] Executar validação integrada com API e ETL, registrar o fluxo testado e corrigir incompatibilidades de contrato.
- [ ] T025 [Plan:6.4] Criar `README.md` documentando execução local, Docker, testes, CORS, arquitetura e limites do MVP.
- [ ] T026 [Plan:6.1,6.2,6.3] Executar lint, type-check, testes, build Docker e smoke test das rotas principais antes da publicação.

## Estrutura esperada

```text
data-quality-dashboard/
├── src/
│   ├── api/
│   │   ├── __tests__/
│   │   ├── client.ts
│   │   └── sources.ts
│   ├── components/
│   │   ├── __tests__/
│   │   ├── AppLayout.tsx
│   │   ├── CheckHistory.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorState.tsx
│   │   ├── LoadingState.tsx
│   │   ├── MetricsPanel.tsx
│   │   ├── RuleResults.tsx
│   │   ├── SourceTable.tsx
│   │   ├── StatusBadge.tsx
│   │   └── SummaryCard.tsx
│   ├── pages/
│   │   ├── __tests__/
│   │   ├── DashboardPage.tsx
│   │   ├── SourceDetailsPage.tsx
│   │   └── SourceFormPage.tsx
│   ├── types/
│   │   └── api.ts
│   ├── App.tsx
│   ├── config.ts
│   ├── main.tsx
│   └── styles/
│       └── global.css
├── .env.example
├── Dockerfile
├── nginx.conf
├── package.json
└── README.md
```

## Estratégia de testes e validação

- **Tipo de aplicação**: SPA.
- **Jornadas críticas**:
  1. abrir o dashboard e visualizar fontes reais;
  2. filtrar por freshness/qualidade e atualizar os dados;
  3. abrir detalhes e consultar histórico/métricas/regras;
  4. cadastrar, editar e excluir uma fonte;
  5. visualizar erro de API e recuperar após nova tentativa.
- **Stack primária**: Vitest, Testing Library e mocks controlados de `fetch`;
  smoke test no navegador para as rotas principais.
- **Fallback de infraestrutura**: mocks locais para testes unitários; API
  local via Docker Compose para a validação integrada.
- **Requisitos de ambiente**: Node.js compatível com a versão escolhida para
  Vite, npm, Docker Desktop para integração e Nginx via imagem Docker.
- **Dados de teste**: fixtures determinísticas para fontes, checks e erros;
  a integração deve usar uma fonte isolada e removê-la ao final quando
  possível.
- **Critério de aprovação**: lint, type-check, testes e build sem erro; as
  jornadas críticas devem exibir os estados esperados e nenhum código do
  frontend deve abrir conexão com PostgreSQL.
- **Revisão final**: confirmar cobertura dos dez requisitos, contrato dos
  endpoints, responsividade, acessibilidade básica e documentação executável.

## Requirement Mapping

| REQ ID | Descrição | Plan Items | Evidência de implementação |
|--------|-----------|------------|-----------------------------|
| REQ-001 | Listar fontes reais | P2.1, P2.2, P3.1, P6.3 | `src/api/sources.ts`, `DashboardPage.tsx` |
| REQ-002 | Exibir todos os estados | P2.1, P2.3, P3.1 | `src/types/api.ts`, `StatusBadge.tsx` |
| REQ-003 | Filtros e atualização | P3.2 | `DashboardPage.tsx` |
| REQ-004 | Detalhes e histórico | P2.1, P2.2, P4.1, P4.2 | `SourceDetailsPage.tsx`, `CheckHistory.tsx`, `MetricsPanel.tsx` |
| REQ-005 | CRUD de fontes | P2.2, P5.1, P5.2, P5.3 | `src/api/sources.ts`, `SourceFormPage.tsx`, `SourceTable.tsx` |
| REQ-006 | Loading, vazio e erros | P2.2, P2.3, P4.2, P5.1, P5.3 | `LoadingState.tsx`, `EmptyState.tsx`, `ErrorState.tsx` |
| REQ-007 | Responsividade e acessibilidade visual | P1.2, P2.3, P4.2 | `global.css`, componentes de estado |
| REQ-008 | Testes automatizados | P6.1 | `src/**/__tests__` |
| REQ-009 | Docker/Nginx | P1.1, P6.2 | `Dockerfile`, `nginx.conf` |
| REQ-010 | Documentação e desacoplamento | P1.1, P2.2, P6.3, P6.4 | `README.md`, arquitetura sem acesso ao banco |

Todos os requisitos derivados do [frontend-plan.md](./frontend-plan.md) estão
cobertos por pelo menos um item do plano e por tarefas executáveis.
