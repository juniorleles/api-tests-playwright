/**
 * TAREFA 1 + 2 — Testes GET
 * Endpoint: /posts, /posts/:id, /users, /comments
 * Cobre: status codes, headers, corpo, cenários positivos e negativos
 */

const { test, expect } = require('@playwright/test');
const {
  validateJsonHeaders,
  validatePostStructure,
  validateUserStructure,
  validateCommentStructure,
} = require('../utils/helpers');

// ─────────────────────────────────────────────────────────────
// GET /posts
// ─────────────────────────────────────────────────────────────
test.describe('GET /posts', () => {

  test('POSITIVO — retorna lista de posts com status 200', async ({ request }) => {
    const response = await request.get('/posts');

    // Status code
    expect(response.status()).toBe(200);

    // Headers
    await validateJsonHeaders(response, expect);

    // Corpo
    const posts = await response.json();
    expect(Array.isArray(posts)).toBe(true);
    expect(posts.length).toBe(100);

    // Estrutura do primeiro item
    validatePostStructure(posts[0], expect);
  });

  test('POSITIVO — filtra posts por userId via query param', async ({ request }) => {
    const response = await request.get('/posts?userId=1');

    expect(response.status()).toBe(200);

    const posts = await response.json();
    expect(Array.isArray(posts)).toBe(true);
    expect(posts.length).toBeGreaterThan(0);

    // Todos os posts devem pertencer ao userId=1
    posts.forEach(post => {
      expect(post.userId).toBe(1);
    });
  });

  test('POSITIVO — retorna post específico por ID', async ({ request }) => {
    const response = await request.get('/posts/1');

    expect(response.status()).toBe(200);
    await validateJsonHeaders(response, expect);

    const post = await response.json();
    validatePostStructure(post, expect);
    expect(post.id).toBe(1);
  });

  test('POSITIVO — retorna post no limite máximo (id=100)', async ({ request }) => {
    const response = await request.get('/posts/100');

    expect(response.status()).toBe(200);
    const post = await response.json();
    expect(post.id).toBe(100);
  });

  test('NEGATIVO — post inexistente retorna 404', async ({ request }) => {
    const response = await request.get('/posts/99999');

    expect(response.status()).toBe(404);

    // Corpo deve ser objeto vazio ou mensagem de erro
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

  test('POSITIVO — retorna lista de usuários com status 200', async ({ request }) => {
    const response = await request.get('/users');

    expect(response.status()).toBe(200);
    await validateJsonHeaders(response, expect);

    const users = await response.json();
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBe(10);

    validateUserStructure(users[0], expect);
  });

  test('POSITIVO — retorna usuário específico por ID', async ({ request }) => {
    const response = await request.get('/users/1');

    expect(response.status()).toBe(200);

    const user = await response.json();
    validateUserStructure(user, expect);
    expect(user.id).toBe(1);
    expect(user.name).toBe('Leanne Graham');
  });

  test('POSITIVO — usuário possui objeto address aninhado', async ({ request }) => {
    const response = await request.get('/users/1');
    const user = await response.json();

    expect(user).toHaveProperty('address');
    expect(user.address).toHaveProperty('street');
    expect(user.address).toHaveProperty('city');
    expect(user.address).toHaveProperty('geo');
    expect(user.address.geo).toHaveProperty('lat');
    expect(user.address.geo).toHaveProperty('lng');
  });

  test('NEGATIVO — usuário inexistente retorna 404', async ({ request }) => {
    const response = await request.get('/users/99999');

    expect(response.status()).toBe(404);
  });

});

// ─────────────────────────────────────────────────────────────
// GET /comments
// ─────────────────────────────────────────────────────────────
test.describe('GET /comments', () => {

  test('POSITIVO — retorna comentários com status 200', async ({ request }) => {
    const response = await request.get('/comments');

    expect(response.status()).toBe(200);
    await validateJsonHeaders(response, expect);

    const comments = await response.json();
    expect(Array.isArray(comments)).toBe(true);
    expect(comments.length).toBe(500);

    validateCommentStructure(comments[0], expect);
  });

  test('POSITIVO — filtra comentários por postId', async ({ request }) => {
    const response = await request.get('/comments?postId=1');

    expect(response.status()).toBe(200);

    const comments = await response.json();
    expect(comments.length).toBeGreaterThan(0);
    comments.forEach(c => expect(c.postId).toBe(1));
  });

  test('POSITIVO — email nos comentários é válido', async ({ request }) => {
    const response = await request.get('/comments/1');
    const comment = await response.json();

    expect(comment.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  test('NEGATIVO — comentário inexistente retorna 404', async ({ request }) => {
    const response = await request.get('/comments/99999');

    expect(response.status()).toBe(404);
  });

  test('NEGATIVO — postId inválido retorna lista vazia', async ({ request }) => {
    const response = await request.get('/comments?postId=99999');

    expect(response.status()).toBe(200);
    const comments = await response.json();
    expect(comments).toEqual([]);
  });

});

// ─────────────────────────────────────────────────────────────
// GET — Headers e performance
// ─────────────────────────────────────────────────────────────
test.describe('GET — Validação de Headers', () => {

  test('POSITIVO — resposta inclui header Content-Type JSON', async ({ request }) => {
    const response = await request.get('/posts/1');
    const ct = response.headers()['content-type'];
    expect(ct).toContain('application/json');
  });

  test('POSITIVO — resposta não retorna Content-Type HTML em endpoint JSON', async ({ request }) => {
    const response = await request.get('/posts/1');
    const ct = response.headers()['content-type'];
    expect(ct).not.toContain('text/html');
  });

  test('POSITIVO — resposta retorna em menos de 5 segundos', async ({ request }) => {
    const start = Date.now();
    const response = await request.get('/posts');
    const duration = Date.now() - start;

    expect(response.status()).toBe(200);
    expect(duration).toBeLessThan(5000);
  });

});
