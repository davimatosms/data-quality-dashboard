# Plano do Frontend — Data Quality Dashboard

## 1. Objetivo

Criar um dashboard web para visualizar e testar a integração entre:

```text
etl-data-quality → data-quality-api → data-quality-dashboard
```

O frontend será um projeto separado, consumindo a API por HTTP. Não terá
regras próprias de qualidade nem acesso direto ao PostgreSQL.

## 2. Responsabilidades

### ETL

- extrair, validar, transformar e carregar dados;
- executar as regras de qualidade;
- enviar checks para a API.

### API

- cadastrar fontes;
- persistir checks e histórico;
- calcular `UNKNOWN`, `FRESH` e `STALE`;
- expor status `PASSING` ou `FAILING`.

### Frontend

- apresentar o estado das fontes;
- permitir cadastro e edição de fontes;
- exibir histórico e métricas;
- facilitar testes manuais da API.

## 3. Stack proposta

- React;
- TypeScript;
- Vite;
- CSS responsivo, preferencialmente Tailwind CSS;
- `fetch` ou cliente HTTP tipado;
- Vitest e Testing Library;
- Docker com Nginx para produção.

O projeto deverá ser criado em um terceiro repositório:

```text
data-quality-dashboard
```

Os repositórios existentes permanecem independentes.

## 4. Telas do MVP

### 4.1 Dashboard geral

Rota: `/`

- cards com total de fontes;
- quantidade `FRESH`, `STALE` e `UNKNOWN`;
- quantidade `PASSING`, `FAILING` e `UNKNOWN`;
- tabela de fontes;
- filtros por freshness e qualidade;
- atualização manual e automática.

Cada linha deverá mostrar:

- nome;
- freshness;
- qualidade;
- frequência esperada;
- horário do último check;
- link para detalhes.

### 4.2 Detalhes da fonte

Rota: `/sources/:id`

- nome e descrição;
- freshness atual;
- qualidade atual;
- frequência e tolerância;
- métricas do último check;
- resultados das regras;
- histórico dos últimos checks;
- mensagens de falha;
- data/hora da última atualização.

### 4.3 Cadastro e edição

Rotas:

- `/sources/new`
- `/sources/:id/edit`

Campos:

- nome;
- descrição;
- frequência em minutos;
- tolerância;
- regras esperadas.

O formulário usará `POST /sources` e `PUT /sources/{id}`.

## 5. Contrato com a API

Base URL configurável por variável:

```env
VITE_API_URL=http://localhost:8000
```

Endpoints usados:

```text
GET    /health
GET    /sources
POST   /sources
PUT    /sources/{id}
DELETE /sources/{id}
GET    /sources/{id}/status
POST   /sources/{id}/checks
```

O frontend não deverá depender de campos internos do banco. Os tipos
TypeScript devem refletir os schemas expostos pela API.

## 6. Estados visuais

### Freshness

| Estado | Cor sugerida | Significado |
|---|---|---|
| `FRESH` | verde | fonte atualizada dentro da tolerância |
| `STALE` | vermelho | fonte atrasada |
| `UNKNOWN` | cinza | ainda não há check |

### Qualidade

| Estado | Cor sugerida | Significado |
|---|---|---|
| `PASSING` | verde | regras aprovadas |
| `FAILING` | vermelho | uma ou mais regras falharam |
| `UNKNOWN` | cinza | ainda não há resultado |

As cores nunca serão a única indicação: os badges também exibirão texto.

## 7. Integração local

Durante o desenvolvimento, os projetos continuarão separados:

```text
F:\Projetos\data-quality-api
F:\Projetos\etl-data-quality
F:\Projetos\data-quality-dashboard
```

O frontend acessará `http://localhost:8000`. A API deverá permitir a origem
do frontend via CORS.

Para a demonstração integrada, o Compose poderá incluir:

```text
api-db → api → etl-demo
              ↑
          dashboard
```

O dashboard será um cliente visual; não executará o pipeline diretamente.

## 8. Organização sugerida

```text
data-quality-dashboard/
├── src/
│   ├── api/
│   │   ├── client.ts
│   │   └── sources.ts
│   ├── components/
│   │   ├── StatusBadge.tsx
│   │   ├── SummaryCard.tsx
│   │   └── SourceTable.tsx
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── SourceDetailsPage.tsx
│   │   └── SourceFormPage.tsx
│   ├── types/
│   │   └── api.ts
│   ├── App.tsx
│   └── main.tsx
├── tests/
├── Dockerfile
├── nginx.conf
├── package.json
└── README.md
```

## 9. Ordem de implementação

1. Criar o repositório React + TypeScript + Vite.
2. Configurar lint, testes e `VITE_API_URL`.
3. Criar tipos TypeScript para fontes, checks e status.
4. Implementar cliente HTTP e tratamento de erros.
5. Implementar dashboard geral.
6. Implementar badges e cards de status.
7. Implementar tela de detalhes e histórico.
8. Implementar cadastro e edição de fontes.
9. Adicionar loading, estado vazio e mensagens de erro.
10. Configurar CORS na API.
11. Criar Dockerfile e Nginx.
12. Adicionar o frontend à demonstração integrada.
13. Testar o fluxo completo com API e ETL.
14. Documentar execução e publicar o repositório.

## 10. Critérios de aceite

- [ ] Dashboard lista fontes reais da API.
- [ ] Status `FRESH`, `STALE`, `UNKNOWN`, `PASSING` e `FAILING` são exibidos.
- [ ] Detalhes mostram histórico, regras e métricas.
- [ ] É possível cadastrar, editar e excluir fonte.
- [ ] Erros da API são apresentados ao usuário.
- [ ] A interface funciona em desktop e telas menores.
- [ ] Testes cobrem cliente HTTP, estados e formulários.
- [ ] Frontend roda via Docker.
- [ ] README explica a arquitetura dos três projetos.
- [ ] Nenhum acesso direto ao banco existe no frontend.

## 11. Decisões adiadas

Ficam fora do MVP:

- autenticação e autorização;
- alertas por e-mail ou Slack;
- gráficos avançados;
- execução manual do ETL pelo navegador;
- edição de regras após o check;
- paginação no backend;
- hospedagem em Azure.

Esses itens podem ser adicionados após o dashboard básico estar validado.
