/**
 * Testes GET
 * Endpoint: /posts, /posts/:id, /users, /comments, /todos
 *
 * Melhorias aplicadas:
 * - Validação por contrato (schemas centralizados em contracts/schemas.js)
 * - Validação de objetos aninhados (address, geo, company)
 * - Assertions mais descritivas com mensagens de erro claras
 */

const { test, expect } = require('@playwright/test');
const { validateJsonHeaders } = require('../utils/helpers');
const {
  validatePostContract,
  validateCommentContract,
  validateUserContract,
} = require('../contracts/schemas');

// ─────────────────────────────────────────────────────────────
// GET /posts
// ─────────────────────────────────────────────────────────────
test.describe('GET /posts', () => {

  test('POSITIVO — retorna lista de posts com status 200 e contrato válido', async ({ request }) => {
    const response = await request.get('/posts');

    expect(response.status()).toBe(200);
    await validateJsonHeaders(response, expect);

    const posts = await response.json();
    expect(Array.isArray(posts), 'Resposta deve ser um array').toBe(true);
    expect(posts.length, 'Lista deve conter 100 posts').toBe(100);

    // Valida contrato dos 3 primeiros para não sobrecarregar
    posts.slice(0, 3).forEach((post, i) => {
      validatePostContract(post, expect);
    });
  });

  test('POSITIVO — filtra posts por userId e valida todos os itens retornados', async ({ request }) => {
    const response = await request.get('/posts?userId=1');

    expect(response.status()).toBe(200);

    const posts = await response.json();
    expect(Array.isArray(posts)).toBe(true);
    expect(posts.length, 'Deve retornar posts para userId=1').toBeGreaterThan(0);

    posts.forEach(post => {
      expect(post.userId, `Todos os posts devem pertencer ao userId=1`).toBe(1);
      validatePostContract(post, expect);
    });
  });

  test('POSITIVO — retorna post específico por ID com contrato completo', async ({ request }) => {
    const response = await request.get('/posts/1');

    expect(response.status()).toBe(200);
    await validateJsonHeaders(response, expect);

    const post = await response.json();
    validatePostContract(post, expect);
    expect(post.id).toBe(1);
  });

  test('POSITIVO — retorna post no limite máximo (id=100) com contrato válido', async ({ request }) => {
    const response = await request.get('/posts/100');

    expect(response.status()).toBe(200);

    const post = await response.json();
    validatePostContract(post, expect);
    expect(post.id).toBe(100);
  });

  test('NEGATIVO — post inexistente retorna 404', async ({ request }) => {
    const response = await request.get('/posts/99999');

    expect(response.status(), 'ID inexistente deve retornar 404').toBe(404);
    const body = await response.json();
    expect(body).toBeDefined();
  });

  test('NEGATIVO — ID inválido (string) retorna 404', async ({ request }) => {
    const response = await request.get('/posts/nao-existe');
    expect(response.status()).toBe(404);
  });

  test('NEGATIVO — ID negativo retorna 404', async ({ request }) => {
    const response = await request.get('/posts/-1');
    expect(response.status()).toBe(404);
  });

});

// ─────────────────────────────────────────────────────────────
// GET /users
// ─────────────────────────────────────────────────────────────
test.describe('GET /users', () => {

  test('POSITIVO — retorna lista de usuários com contrato completo (incluindo objetos aninhados)', async ({ request }) => {
    const response = await request.get('/users');

    expect(response.status()).toBe(200);
    await validateJsonHeaders(response, expect);

    const users = await response.json();
    expect(Array.isArray(users)).toBe(true);
    expect(users.length, 'Lista deve conter 10 usuários').toBe(10);

    // Valida contrato completo com objetos aninhados
    users.forEach(user => validateUserContract(user, expect));
  });

  test('POSITIVO — retorna usuário específico com todos os campos e objetos aninhados', async ({ request }) => {
    const response = await request.get('/users/1');

    expect(response.status()).toBe(200);

    const user = await response.json();
    validateUserContract(user, expect);
    expect(user.id).toBe(1);
    expect(user.name).toBe('Leanne Graham');
  });

  test('NEGATIVO — usuário inexistente retorna 404', async ({ request }) => {
    const response = await request.get('/users/99999');
    expect(response.status(), 'Usuário inexistente deve retornar 404').toBe(404);
  });

});

// ─────────────────────────────────────────────────────────────
// GET /comments
// ─────────────────────────────────────────────────────────────
test.describe('GET /comments', () => {

  test('POSITIVO — retorna comentários com contrato completo', async ({ request }) => {
    const response = await request.get('/comments');

    expect(response.status()).toBe(200);
    await validateJsonHeaders(response, expect);

    const comments = await response.json();
    expect(Array.isArray(comments)).toBe(true);
    expect(comments.length, 'Lista deve conter 500 comentários').toBe(500);

    comments.slice(0, 3).forEach(comment => validateCommentContract(comment, expect));
  });

  test('POSITIVO — filtra comentários por postId e valida contrato', async ({ request }) => {
    const response = await request.get('/comments?postId=1');

    expect(response.status()).toBe(200);

    const comments = await response.json();
    expect(comments.length).toBeGreaterThan(0);
    comments.forEach(comment => {
      expect(comment.postId, 'Todos devem pertencer ao postId=1').toBe(1);
      validateCommentContract(comment, expect);
    });
  });

  test('POSITIVO — email nos comentários é válido (formato RFC)', async ({ request }) => {
    const response = await request.get('/comments/1');
    const comment = await response.json();

    validateCommentContract(comment, expect);
  });

  test('NEGATIVO — comentário inexistente retorna 404', async ({ request }) => {
    const response = await request.get('/comments/99999');
    expect(response.status()).toBe(404);
  });

  test('NEGATIVO — postId inválido retorna lista vazia', async ({ request }) => {
    const response = await request.get('/comments?postId=99999');

    expect(response.status()).toBe(200);
    const comments = await response.json();
    expect(comments, 'PostId inválido deve retornar array vazio').toEqual([]);
  });

});

// ─────────────────────────────────────────────────────────────
// GET — Headers e Performance
// ─────────────────────────────────────────────────────────────
test.describe('GET — Validação de Headers e Performance', () => {

  test('POSITIVO — resposta inclui Content-Type JSON', async ({ request }) => {
    const response = await request.get('/posts/1');
    expect(response.headers()['content-type']).toContain('application/json');
  });

  test('POSITIVO — resposta não retorna Content-Type HTML', async ({ request }) => {
    const response = await request.get('/posts/1');
    expect(response.headers()['content-type']).not.toContain('text/html');
  });

  test('POSITIVO — resposta retorna em menos de 5 segundos', async ({ request }) => {
    const start = Date.now();
    const response = await request.get('/posts');
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(duration, `Resposta demorou ${duration}ms, limite é 5000ms`).toBeLessThan(5000);
  });

});
