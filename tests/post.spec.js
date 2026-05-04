/**
 * Testes POST
 * Endpoint: /posts, /comments
 *
 * Melhorias aplicadas:
 * - Validação por contrato no retorno da criação
 * - Uso de buildPostPayload / buildCommentPayload para payloads variados
 * - Assertions com mensagens descritivas
 */

const { test, expect } = require('@playwright/test');
const {
  validateJsonHeaders,
  VALID_POST_PAYLOAD,
  VALID_COMMENT_PAYLOAD,
  buildPostPayload,
  buildCommentPayload,
} = require('../utils/helpers');
const { validatePostContract, validateCommentContract } = require('../contracts/schemas');

// ─────────────────────────────────────────────────────────────
// POST /posts
// ─────────────────────────────────────────────────────────────
test.describe('POST /posts', () => {

  test('POSITIVO — cria post com payload completo, retorna 201 e valida contrato', async ({ request }) => {
    const response = await request.post('/posts', {
      data: VALID_POST_PAYLOAD,
    });

    expect(response.status(), 'Criação deve retornar 201').toBe(201);
    await validateJsonHeaders(response, expect);

    const post = await response.json();

    // Contrato completo do recurso criado
    expect(post, 'Deve retornar id gerado').toHaveProperty('id');
    expect(typeof post.id, 'id deve ser number').toBe('number');
    expect(post.title, 'title deve espelhar o payload').toBe(VALID_POST_PAYLOAD.title);
    expect(post.body, 'body deve espelhar o payload').toBe(VALID_POST_PAYLOAD.body);
    expect(post.userId, 'userId deve espelhar o payload').toBe(VALID_POST_PAYLOAD.userId);
  });

  test('POSITIVO — ID gerado é maior que 100 (auto-incremento simulado)', async ({ request }) => {
    const response = await request.post('/posts', { data: VALID_POST_PAYLOAD });
    const post = await response.json();

    expect(post.id, 'JSONPlaceholder retorna id > 100 para novos posts').toBeGreaterThan(100);
  });

  test('POSITIVO — cria post com userId diferente e valida retorno', async ({ request }) => {
    const payload = buildPostPayload({ userId: 5 });
    const response = await request.post('/posts', { data: payload });

    expect(response.status()).toBe(201);
    const post = await response.json();
    expect(post.userId, 'userId deve ser 5 conforme enviado').toBe(5);
  });

  test('POSITIVO — aceita post com title longo e preserva o conteúdo', async ({ request }) => {
    const longTitle = 'A'.repeat(500);
    const payload = buildPostPayload({ title: longTitle });
    const response = await request.post('/posts', { data: payload });

    expect(response.status()).toBe(201);
    const post = await response.json();
    expect(post.title, 'Title longo deve ser preservado no retorno').toBe(longTitle);
  });

  test('POSITIVO — cria post com caracteres especiais e acentuação', async ({ request }) => {
    const payload = buildPostPayload({
      title: 'Título com acentuação: ção, ã, ê, ü',
      body: 'Conteúdo com emojis 🚀 e símbolos: @#$%',
    });
    const response = await request.post('/posts', { data: payload });

    expect(response.status()).toBe(201);
    const post = await response.json();
    expect(post.title).toBe(payload.title);
  });

  test('NEGATIVO — payload sem title: JSONPlaceholder é permissivo (documenta comportamento)', async ({ request }) => {
    const response = await request.post('/posts', {
      data: { body: 'sem titulo', userId: 1 },
    });
    expect([201, 400], 'API permissiva aceita payload incompleto').toContain(response.status());
  });

  test('NEGATIVO — payload vazio retorna resposta com id (JSONPlaceholder permissivo)', async ({ request }) => {
    const response = await request.post('/posts', { data: {} });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body, 'Mesmo vazio, JSONPlaceholder retorna id').toHaveProperty('id');
  });

  test('NEGATIVO — userId como string inválida (documenta comportamento da API)', async ({ request }) => {
    const response = await request.post('/posts', {
      data: buildPostPayload({ userId: 'nao-e-numero' }),
    });
    expect([201, 400, 422]).toContain(response.status());
  });

  test('NEGATIVO — Content-Type errado (text/plain) documenta comportamento', async ({ request }) => {
    const response = await request.post('/posts', {
      data: JSON.stringify(VALID_POST_PAYLOAD),
      headers: { 'Content-Type': 'text/plain', 'Accept': 'application/json' },
    });
    expect([201, 400, 415]).toContain(response.status());
  });

});

// ─────────────────────────────────────────────────────────────
// POST /comments
// ─────────────────────────────────────────────────────────────
test.describe('POST /comments', () => {

  test('POSITIVO — cria comentário com payload completo e valida contrato', async ({ request }) => {
    const response = await request.post('/comments', {
      data: VALID_COMMENT_PAYLOAD,
    });

    expect(response.status(), 'Criação deve retornar 201').toBe(201);
    await validateJsonHeaders(response, expect);

    const comment = await response.json();
    expect(comment).toHaveProperty('id');
    expect(comment.postId, 'postId deve espelhar o payload').toBe(VALID_COMMENT_PAYLOAD.postId);
    expect(comment.email, 'email deve espelhar o payload').toBe(VALID_COMMENT_PAYLOAD.email);
    expect(comment.name).toBe(VALID_COMMENT_PAYLOAD.name);
    expect(comment.body).toBe(VALID_COMMENT_PAYLOAD.body);
  });

  test('POSITIVO — cria comentário em post diferente', async ({ request }) => {
    const payload = buildCommentPayload({ postId: 5 });
    const response = await request.post('/comments', { data: payload });

    expect(response.status()).toBe(201);
    const comment = await response.json();
    expect(comment.postId).toBe(5);
  });

  test('NEGATIVO — email inválido no comentário (documenta comportamento)', async ({ request }) => {
    const response = await request.post('/comments', {
      data: buildCommentPayload({ email: 'email-invalido-sem-arroba' }),
    });
    expect([201, 400, 422]).toContain(response.status());
  });

});

// ─────────────────────────────────────────────────────────────
// POST — Autenticação
// ─────────────────────────────────────────────────────────────
test.describe('POST — Autenticação e Autorização', () => {

  test('NEGATIVO — sem Authorization header (API pública não exige, documenta comportamento)', async ({ request }) => {
    const response = await request.post('/posts', {
      data: VALID_POST_PAYLOAD,
      headers: { 'Content-Type': 'application/json' },
    });
    expect(response.status(), 'API pública deve aceitar sem token').toBe(201);
  });

  test('NEGATIVO — token inválido no header (API pública ignora, documenta comportamento)', async ({ request }) => {
    const response = await request.post('/posts', {
      data: VALID_POST_PAYLOAD,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token-invalido-12345',
      },
    });
    expect([201, 401, 403]).toContain(response.status());
  });

});
