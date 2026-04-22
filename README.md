# API Tests — Playwright

Testes automatizados de API usando **Playwright** com a API pública [JSONPlaceholder](https://jsonplaceholder.typicode.com).

## Estrutura do projeto

```
api-tests-playwright/
├── tests/
│   ├── get.spec.js          # Testes GET — /posts, /users, /comments
│   ├── post.spec.js         # Testes POST — criação de recursos
│   ├── put-patch.spec.js    # Testes PUT e PATCH — atualização
│   ├── delete.spec.js       # Testes DELETE — remoção
│   └── flows.spec.js        # Fluxos CRUD completos encadeados
├── utils/
│   └── helpers.js           # Funções auxiliares e payloads reutilizáveis
├── reports/                 # Relatórios gerados (criado automaticamente)
├── playwright.config.js     # Configuração do Playwright
├── package.json
└── README.md
```

## Pré-requisitos

- Node.js 18 ou superior
- npm 9 ou superior

## Instalação

```bash
# Clonar o repositório
git clone https://github.com/seu-usuario/api-tests-playwright.git
cd api-tests-playwright

# Instalar dependências
npm install

# Instalar browsers do Playwright (necessário apenas uma vez)
npx playwright install
```

## Executando os testes

```bash
# Rodar todos os testes
npm test

# Rodar com saída detalhada no terminal
npm run test:list

# Rodar e gerar relatório HTML interativo
npm run test:report

# Rodar somente um arquivo de testes
npm run test:get
npm run test:post
npm run test:put-patch
npm run test:delete
npm run test:flows
```

## Relatório HTML

Após rodar `npm run test:report`, o relatório é gerado em `reports/html/index.html`.  
Ele mostra todos os testes, resultados, tempo de execução e detalhes de cada falha.

## Cobertura de testes

| Método | Endpoint          | Positivos | Negativos | Total |
|--------|-------------------|-----------|-----------|-------|
| GET    | /posts            | 4         | 3         | 7     |
| GET    | /users            | 3         | 1         | 4     |
| GET    | /comments         | 3         | 2         | 5     |
| GET    | Headers/perf      | 3         | 0         | 3     |
| POST   | /posts            | 4         | 5         | 9     |
| POST   | /comments         | 1         | 1         | 2     |
| POST   | Autenticação      | 0         | 2         | 2     |
| PUT    | /posts/:id        | 3         | 3         | 6     |
| PUT    | /users/:id        | 1         | 0         | 1     |
| PATCH  | /posts/:id        | 3         | 3         | 6     |
| DELETE | /posts/:id        | 4         | 5         | 9     |
| DELETE | /comments/:id     | 1         | 1         | 2     |
| DELETE | /todos/:id        | 1         | 1         | 2     |
| DELETE | Headers           | 1         | 0         | 1     |
| FLOWS  | CRUD completo     | 3         | 1         | 4     |
| **Total** |               | **35**    | **28**    | **63** |

## O que é testado

### Testes positivos
- Status codes corretos (200, 201)
- Headers `Content-Type: application/json`
- Estrutura e tipos dos campos no corpo da resposta
- Filtragem via query params
- Paginação e limites
- Tempo de resposta (< 5s)

### Testes negativos
- Recursos inexistentes → 404
- IDs inválidos (string, negativo, zero) → 404
- Payloads malformados ou vazios
- Content-Type errado
- Tokens de autenticação inválidos
- Métodos HTTP inválidos em endpoints
- Idempotência do DELETE

### Fluxos encadeados
- CRUD completo: POST → GET → PUT → PATCH → DELETE
- Criação de post + comentários + listagem
- Busca de usuário + posts do usuário + comentários dos posts
- Sequência de erros em recurso inexistente

## API utilizada

[JSONPlaceholder](https://jsonplaceholder.typicode.com) — API REST pública e gratuita para testes.  
Não requer autenticação. Simula operações CRUD mas não persiste dados reais.

## Tecnologias

- [Playwright](https://playwright.dev/) — framework de testes
- [JSONPlaceholder](https://jsonplaceholder.typicode.com) — API de exemplo
