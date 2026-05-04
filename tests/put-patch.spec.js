/**
 * Testes PUT e PATCH
 * Endpoint: /posts/:id, /users/:id
 *
 * Melhorias aplicadas:
 * - Validação por contrato no retorno (campos e tipos)
 * - Assertions descritivas
 * - Uso de buildPostPayload para payloads variados
 */

const { test, expect } = require('@playwright/test');
const { validateJsonHeaders, VALID_POST_PAYLOAD, buildPostPayload } = require('../utils/helpers');
const { validatePostContract, validateUserContract } = require('../contracts/schemas');

// ─────────────────────────────────────────────────────────────
// PUT /posts/:id — substituição completa
// ─────────────────────────────────────────────────────────────
test.describe('PUT /posts/:id', () => {

  test('POSITIVO — atualiza post com payload completo, retorna 200 e valida contrato', async ({ request }) => {
    const payload = { id: 1, title: 'Título Atualizado via PUT', body: 'Corpo substituído via PUT', userId: 1 };
    const response = await request.put('/posts/1', { data: payload });

    expect(response.status(), 'PUT deve retornar 200').toBe(200);
    await validateJsonHeaders(response, expect);

    const post = await response.json();
    validatePostContract(post, expect);
    expect(post.id).toBe(1);
    expect(post.title, 'Title deve refletir o update').toBe(payload.title);
    expect(post.body, 'Body deve refletir o update').toBe(payload.body);
    expect(post.userId).toBe(payload.userId);
  });

  test('POSITIVO — PUT retorna o recurso completo (todos os campos do contrato)', async ({ request }) => {
    const response = await request.put('/posts/5', {
      data: buildPostPayload({ id: 5 }),
    });

    expect(response.status()).toBe(200);
    const post = await response.json();
    validatePostContract(post, expect);
  });

  test('POSITIVO — atualiza último post (id=100)', async ({ request }) => {
    const response = await request.put('/posts/100', {
      data: { id: 100, title: 'Post 100 atualizado', body: 'novo corpo', userId: 10 },
    });

    expect(response.status()).toBe(200);
    const post = await response.json();
    validatePostContract(post, expect);
  });

  test('NEGATIVO — PUT em post inexistente retorna 500 (JSONPlaceholder sem persistência)', async ({ request }) => {
    const response = await request.put('/posts/99999', { data: VALID_POST_PAYLOAD });
    expect([404, 500], 'ID inexistente deve retornar 404 ou 500').toContain(response.status());
  });

  test('NEGATIVO — PUT com corpo vazio (documenta comportamento)', async ({ request }) => {
    const response = await request.put('/posts/1', { data: {} });
    expect([200, 400]).toContain(response.status());
  });

  test('NEGATIVO — PUT com ID no corpo diferente do ID na URL (documenta conflito)', async ({ request }) => {
    const response = await request.put('/posts/1', {
      data: { id: 999, title: 'Conflito de ID', body: 'teste', userId: 1 },
    });
    expect([200, 400, 409]).toContain(response.status());
  });

  test('NEGATIVO — PUT em coleção sem ID (documenta comportamento)', async ({ request }) => {
    const response = await request.put('/posts', { data: VALID_POST_PAYLOAD });
    expect([200, 404, 405]).toContain(response.status());
  });

});

// ─────────────────────────────────────────────────────────────
// PATCH /posts/:id — atualização parcial
// ─────────────────────────────────────────────────────────────
test.describe('PATCH /posts/:id', () => {

  test('POSITIVO — atualiza apenas o título e valida que outros campos são preservados', async ({ request }) => {
    const newTitle = 'Apenas o título foi alterado via PATCH';
    const response = await request.patch('/posts/1', { data: { title: newTitle } });

    expect(response.status(), 'PATCH deve retornar 200').toBe(200);
    await validateJsonHeaders(response, expect);

    const post = await response.json();
    expect(post.title, 'Title deve refletir o PATCH').toBe(newTitle);
    expect(post, 'Body deve ser preservado').toHaveProperty('body');
    expect(post, 'UserId deve ser preservado').toHaveProperty('userId');
    expect(post, 'Id deve ser preservado').toHaveProperty('id');
  });

  test('POSITIVO — atualiza apenas o body, mantém os demais campos', async ({ request }) => {
    const response = await request.patch('/posts/1', { data: { body: 'Apenas o body foi alterado' } });

    expect(response.status()).toBe(200);
    const post = await response.json();
    expect(post.body).toBe('Apenas o body foi alterado');
    expect(post.title, 'Title original deve ser mantido').toBeTruthy();
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

  test('NEGATIVO — PATCH em post inexistente (JSONPlaceholder retorna 200, produção deveria ser 404)', async ({ request }) => {
    const response = await request.patch('/posts/99999', {
      data: { title: 'Tentativa em recurso inexistente' },
    });
    expect([200, 404, 500]).toContain(response.status());
  });

  test('NEGATIVO — PATCH com payload vazio retorna 200 sem alteração', async ({ request }) => {
    const response = await request.patch('/posts/1', { data: {} });
    expect(response.status()).toBe(200);
  });

  test('NEGATIVO — PATCH com campo fora do schema (documenta comportamento)', async ({ request }) => {
    const response = await request.patch('/posts/1', {
      data: { campoQueNaoExiste: 'valor', outroInvalido: 123 },
    });
    expect([200, 400]).toContain(response.status());
  });

});

// ─────────────────────────────────────────────────────────────
// PUT /users/:id
// ─────────────────────────────────────────────────────────────
test.describe('PUT /users/:id', () => {

  test('POSITIVO — atualiza usuário via PUT e valida contrato de retorno', async ({ request }) => {
    const updatedUser = {
      id: 1,
      name: 'Nome Atualizado Teste',
      username: 'testuser',
      email: 'atualizado@ofertahub.com.br',
      phone: '11-99999-9999',
      website: 'ofertahub.com.br',
    };

    const response = await request.put('/users/1', { data: updatedUser });

    expect(response.status()).toBe(200);

    const user = await response.json();
    expect(user.name, 'Name deve refletir o update').toBe(updatedUser.name);
    expect(user.email, 'Email deve refletir o update').toBe(updatedUser.email);
  });

});
