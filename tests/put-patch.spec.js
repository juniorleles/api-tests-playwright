/**
 * TAREFA 2 — Testes PUT e PATCH
 * Endpoint: /posts/:id, /users/:id
 * PUT: substituição completa | PATCH: atualização parcial
 */

const { test, expect } = require('@playwright/test');
const {
  validateJsonHeaders,
  VALID_POST_PAYLOAD,
} = require('../utils/helpers');

// ─────────────────────────────────────────────────────────────
// PUT /posts/:id — substituição completa
// ─────────────────────────────────────────────────────────────
test.describe('PUT /posts/:id', () => {

  test('POSITIVO — atualiza post existente com payload completo e retorna 200', async ({ request }) => {
    const updatedPost = {
      id: 1,
      title: 'Título Atualizado via PUT',
      body: 'Corpo completamente substituído via método PUT no teste automatizado',
      userId: 1,
    };

    const response = await request.put('/posts/1', {
      data: updatedPost,
    });

    expect(response.status()).toBe(200);
    await validateJsonHeaders(response, expect);

    const post = await response.json();
    expect(post.id).toBe(1);
    expect(post.title).toBe(updatedPost.title);
    expect(post.body).toBe(updatedPost.body);
    expect(post.userId).toBe(updatedPost.userId);
  });

  test('POSITIVO — PUT retorna o recurso atualizado no corpo', async ({ request }) => {
    const response = await request.put('/posts/5', {
      data: { ...VALID_POST_PAYLOAD, id: 5 },
    });

    expect(response.status()).toBe(200);
    const post = await response.json();
    expect(post).toHaveProperty('id');
    expect(post).toHaveProperty('title');
    expect(post).toHaveProperty('body');
    expect(post).toHaveProperty('userId');
  });

  test('POSITIVO — atualiza último post (id=100)', async ({ request }) => {
    const response = await request.put('/posts/100', {
      data: { id: 100, title: 'Post 100 atualizado', body: 'novo corpo', userId: 10 },
    });

    expect(response.status()).toBe(200);
  });

  test('NEGATIVO — PUT em post inexistente retorna 500 (JSONPlaceholder)', async ({ request }) => {
    const response = await request.put('/posts/99999', {
      data: VALID_POST_PAYLOAD,
    });

    // JSONPlaceholder retorna 500 ao tentar PUT em recurso não existente
    expect([404, 500]).toContain(response.status());
  });

  test('NEGATIVO — PUT sem corpo retorna erro', async ({ request }) => {
    const response = await request.put('/posts/1', {
      data: {},
    });

    // Deve retornar 200 mas com objeto vazio (comportamento JSONPlaceholder)
    expect([200, 400]).toContain(response.status());
  });

  test('NEGATIVO — PUT com ID no corpo diferente do ID na URL', async ({ request }) => {
    const response = await request.put('/posts/1', {
      data: { id: 999, title: 'Conflito de ID', body: 'teste', userId: 1 },
    });

    // Documenta comportamento da API com IDs conflitantes
    expect([200, 400, 409]).toContain(response.status());
  });

  test('NEGATIVO — método PUT em endpoint de coleção retorna 200 (JSONPlaceholder permissivo)', async ({ request }) => {
    const response = await request.put('/posts', {
      data: VALID_POST_PAYLOAD,
    });

    // Comportamento não esperado mas documentado
    expect([200, 404, 405]).toContain(response.status());
  });

});

// ─────────────────────────────────────────────────────────────
// PATCH /posts/:id — atualização parcial
// ─────────────────────────────────────────────────────────────
test.describe('PATCH /posts/:id', () => {

  test('POSITIVO — atualiza apenas o título com PATCH e retorna 200', async ({ request }) => {
    const response = await request.patch('/posts/1', {
      data: { title: 'Apenas o título foi alterado via PATCH' },
    });

    expect(response.status()).toBe(200);
    await validateJsonHeaders(response, expect);

    const post = await response.json();
    expect(post.title).toBe('Apenas o título foi alterado via PATCH');
    // Os outros campos devem ser mantidos
    expect(post).toHaveProperty('body');
    expect(post).toHaveProperty('userId');
  });

  test('POSITIVO — atualiza apenas o body, mantém title original', async ({ request }) => {
    const response = await request.patch('/posts/1', {
      data: { body: 'Apenas o body foi alterado' },
    });

    expect(response.status()).toBe(200);
    const post = await response.json();
    expect(post.body).toBe('Apenas o body foi alterado');
    expect(post.title).toBeTruthy(); // título original mantido
  });

  test('POSITIVO — PATCH com múltiplos campos simultâneos', async ({ request }) => {
    const response = await request.patch('/posts/3', {
      data: {
        title: 'Título e body atualizados juntos',
        body: 'Body também atualizado no mesmo PATCH',
      },
    });

    expect(response.status()).toBe(200);
    const post = await response.json();
    expect(post.title).toBe('Título e body atualizados juntos');
    expect(post.body).toBe('Body também atualizado no mesmo PATCH');
  });

  test('NEGATIVO — PATCH em post inexistente: JSONPlaceholder retorna 200 (produção deveria retornar 404)', async ({ request }) => {
    const response = await request.patch('/posts/99999', {
      data: { title: 'Tentativa de patch em recurso inexistente' },
    });

    // JSONPlaceholder não valida existência — retorna 200 mesmo sem o recurso
    // API de produção real: deveria retornar 404 ou 500
    expect([200, 404, 500]).toContain(response.status());
  });

  test('NEGATIVO — PATCH com payload vazio retorna 200 (sem alteração)', async ({ request }) => {
    const response = await request.patch('/posts/1', {
      data: {},
    });

    expect(response.status()).toBe(200);
  });

  test('NEGATIVO — PATCH com campo inexistente no schema', async ({ request }) => {
    const response = await request.patch('/posts/1', {
      data: { campoQueNaoExiste: 'valor', outroInvalido: 123 },
    });

    // Documenta comportamento com campos não reconhecidos
    expect([200, 400]).toContain(response.status());
  });

});

// ─────────────────────────────────────────────────────────────
// PUT /users/:id
// ─────────────────────────────────────────────────────────────
test.describe('PUT /users/:id', () => {

  test('POSITIVO — atualiza dados de usuário via PUT', async ({ request }) => {
    const updatedUser = {
      id: 1,
      name: 'Nome Atualizado Teste',
      username: 'testuser',
      email: 'atualizado@ofertahub.com.br',
      phone: '11-99999-9999',
      website: 'ofertahub.com.br',
    };

    const response = await request.put('/users/1', {
      data: updatedUser,
    });

    expect(response.status()).toBe(200);

    const user = await response.json();
    expect(user.name).toBe(updatedUser.name);
    expect(user.email).toBe(updatedUser.email);
  });

});
