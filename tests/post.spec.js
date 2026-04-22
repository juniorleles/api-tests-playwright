/**
 * TAREFA 1 + 2 — Testes POST
 * Endpoint: /posts, /comments
 * Cobre: criação, validação de corpo, headers, cenários negativos
 */

const { test, expect } = require('@playwright/test');
const {
  validateJsonHeaders,
  validatePostStructure,
  VALID_POST_PAYLOAD,
  VALID_COMMENT_PAYLOAD,
} = require('../utils/helpers');

// ─────────────────────────────────────────────────────────────
// POST /posts
// ─────────────────────────────────────────────────────────────
test.describe('POST /posts', () => {

  test('POSITIVO — cria post com payload completo e retorna 201', async ({ request }) => {
    const response = await request.post('/posts', {
      data: VALID_POST_PAYLOAD,
    });

    // Status code de criação
    expect(response.status()).toBe(201);

    // Headers
    await validateJsonHeaders(response, expect);

    // Corpo retornado
    const post = await response.json();
    expect(post).toHaveProperty('id');
    expect(typeof post.id).toBe('number');
    expect(post.title).toBe(VALID_POST_PAYLOAD.title);
    expect(post.body).toBe(VALID_POST_PAYLOAD.body);
    expect(post.userId).toBe(VALID_POST_PAYLOAD.userId);
  });

  test('POSITIVO — ID gerado é maior que 100 (auto-incremento simulado)', async ({ request }) => {
    const response = await request.post('/posts', {
      data: VALID_POST_PAYLOAD,
    });

    const post = await response.json();
    // JSONPlaceholder retorna id=101 para novos posts
    expect(post.id).toBeGreaterThan(100);
  });

  test('POSITIVO — cria post com userId diferente', async ({ request }) => {
    const response = await request.post('/posts', {
      data: { ...VALID_POST_PAYLOAD, userId: 5 },
    });

    expect(response.status()).toBe(201);
    const post = await response.json();
    expect(post.userId).toBe(5);
  });

  test('POSITIVO — aceita post com title muito longo', async ({ request }) => {
    const longTitle = 'A'.repeat(500);
    const response = await request.post('/posts', {
      data: { ...VALID_POST_PAYLOAD, title: longTitle },
    });

    expect(response.status()).toBe(201);
    const post = await response.json();
    expect(post.title).toBe(longTitle);
  });

  test('NEGATIVO — payload sem title ainda retorna 201 (JSONPlaceholder permissivo)', async ({ request }) => {
    // JSONPlaceholder é permissivo por design — documentamos o comportamento real
    const response = await request.post('/posts', {
      data: { body: 'sem titulo', userId: 1 },
    });

    // Documentar comportamento real da API
    expect([201, 400]).toContain(response.status());
  });

  test('NEGATIVO — payload vazio retorna resposta com id', async ({ request }) => {
    const response = await request.post('/posts', {
      data: {},
    });

    // JSONPlaceholder aceita payload vazio por design
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('id');
  });

  test('NEGATIVO — payload malformado (string no lugar de objeto)', async ({ request }) => {
    const response = await request.post('/posts', {
      data: 'payload-invalido-nao-e-json',
      headers: { 'Content-Type': 'application/json' },
    });

    // API deve rejeitar ou retornar erro
    expect([400, 201]).toContain(response.status());
  });

  test('NEGATIVO — userId como string inválida', async ({ request }) => {
    const response = await request.post('/posts', {
      data: { ...VALID_POST_PAYLOAD, userId: 'nao-e-numero' },
    });

    // Documentar comportamento — API pode aceitar ou rejeitar
    expect([201, 400, 422]).toContain(response.status());
  });

  test('NEGATIVO — Content-Type errado (text/plain)', async ({ request }) => {
    const response = await request.post('/posts', {
      data: JSON.stringify(VALID_POST_PAYLOAD),
      headers: {
        'Content-Type': 'text/plain',
        'Accept': 'application/json',
      },
    });

    expect([201, 400, 415]).toContain(response.status());
  });

});

// ─────────────────────────────────────────────────────────────
// POST /comments
// ─────────────────────────────────────────────────────────────
test.describe('POST /comments', () => {

  test('POSITIVO — cria comentário com payload completo', async ({ request }) => {
    const response = await request.post('/comments', {
      data: VALID_COMMENT_PAYLOAD,
    });

    expect(response.status()).toBe(201);
    await validateJsonHeaders(response, expect);

    const comment = await response.json();
    expect(comment).toHaveProperty('id');
    expect(comment.postId).toBe(VALID_COMMENT_PAYLOAD.postId);
    expect(comment.email).toBe(VALID_COMMENT_PAYLOAD.email);
  });

  test('NEGATIVO — email inválido no comentário', async ({ request }) => {
    const response = await request.post('/comments', {
      data: { ...VALID_COMMENT_PAYLOAD, email: 'email-invalido-sem-arroba' },
    });

    // Documentar resposta real
    expect([201, 400, 422]).toContain(response.status());
  });

});

// ─────────────────────────────────────────────────────────────
// POST — Autenticação
// ─────────────────────────────────────────────────────────────
test.describe('POST — Autenticação e Autorização', () => {

  test('NEGATIVO — sem Authorization header (JSONPlaceholder não exige, documenta comportamento)', async ({ request }) => {
    // JSONPlaceholder é uma API pública sem auth — mas testamos que funciona SEM token
    const response = await request.post('/posts', {
      data: VALID_POST_PAYLOAD,
      headers: {
        'Content-Type': 'application/json',
        // Sem Authorization header
      },
    });

    // Deve funcionar pois a API é pública
    expect(response.status()).toBe(201);
  });

  test('NEGATIVO — token inválido no header (API pública ignora, documenta comportamento)', async ({ request }) => {
    const response = await request.post('/posts', {
      data: VALID_POST_PAYLOAD,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token-invalido-12345',
      },
    });

    // JSONPlaceholder ignora tokens — documenta que a API pública não autentica
    expect([201, 401, 403]).toContain(response.status());
  });

});
