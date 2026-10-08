# Data Quality Dashboard

Dashboard web para acompanhar a saúde das fontes monitoradas pela
[Data Quality API](https://github.com/davimatosms/data-quality-api). O
pipeline do [ETL Data Quality](https://github.com/davimatosms/etl-data-quality)
continua responsável pela validação e pelo envio dos checks.

```text
ETL Data Quality → Data Quality API → Data Quality Dashboard
```

## Pré-requisitos

- Node.js 22 ou superior;
- npm;
- API disponível em `http://localhost:8000` para integração local.

O dashboard não acessa PostgreSQL e não executa regras do ETL. Todos os dados
vêm dos endpoints HTTP públicos da API.

## Desenvolvimento local

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Por padrão, o frontend usa `http://localhost:8000`. Para alterar a API,
edite `VITE_API_URL` no arquivo `.env`.

Abra `http://localhost:5173`.

## Qualidade

```powershell
npm run lint
npm run type-check
npm test
npm run build
```

## Docker

```powershell
docker build -t data-quality-dashboard .
docker run --rm -p 8080:80 data-quality-dashboard
```

Abra `http://localhost:8080`. O Nginx serve o build estático e redireciona
rotas desconhecidas para `index.html`, permitindo o funcionamento do React
Router após refresh.

## Integração com os projetos relacionados

1. Inicie a API conforme o README de `data-quality-api`.
2. Execute o ETL com `QUALITY_API_URL` e `QUALITY_API_SOURCE_ID`.
3. Abra o dashboard e confirme a fonte na tela inicial.
4. Acesse os detalhes para verificar status, métricas, regras e histórico.

Se o navegador bloquear requisições, configure a origem do dashboard no CORS
da API. Em desenvolvimento, a origem padrão é `http://localhost:5173`.

## Rotas

- `/`: dashboard geral, resumo, filtros e fontes monitoradas;
- `/sources/new`: cadastro de fonte;
- `/sources/:id`: detalhes e histórico;
- `/sources/:id/edit`: edição de fonte.

## Escopo do MVP

Autenticação, alertas, gráficos avançados, paginação, execução manual do ETL
e hospedagem em Azure permanecem fora do MVP atual.
