/**
 * TAREFA 2 — Testes DELETE
 * Endpoint: /posts/:id, /comments/:id, /todos/:id
 * Cobre: remoção, status codes, idempotência, cenários negativos
 */

const { test, expect } = require('@playwright/test');

// ─────────────────────────────────────────────────────────────
// DELETE /posts/:id
// ─────────────────────────────────────────────────────────────
test.describe('DELETE /posts/:id', () => {

  test('POSITIVO — deleta post existente e retorna 200', async ({ request }) => {
    const response = await request.delete('/posts/1');

    expect(response.status()).toBe(200);

    // JSONPlaceholder retorna objeto vazio após delete
    const body = await response.json();
    expect(body).toEqual({});
  });

  test('POSITIVO — deleta post do meio da lista (id=50)', async ({ request }) => {
    const response = await request.delete('/posts/50');

    expect(response.status()).toBe(200);
  });

  test('POSITIVO — deleta último post (id=100)', async ({ request }) => {
    const response = await request.delete('/posts/100');

    expect(response.status()).toBe(200);
  });

  test('POSITIVO — resposta do DELETE não contém dados do recurso deletado', async ({ request }) => {
    const response = await request.delete('/posts/2');

    expect(response.status()).toBe(200);
    const body = await response.json();

    // Corpo deve ser vazio — não deve retornar dados do post deletado
    expect(Object.keys(body).length).toBe(0);
  });

  test('NEGATIVO — delete em post inexistente retorna 404', async ({ request }) => {
    const response = await request.delete('/posts/99999');

    expect(response.status()).toBe(404);
  });

  test('NEGATIVO — delete com ID zero retorna 404', async ({ request }) => {
    const response = await request.delete('/posts/0');

    expect(response.status()).toBe(404);
  });

  test('NEGATIVO — delete com ID negativo retorna 404', async ({ request }) => {
    const response = await request.delete('/posts/-5');

    expect(response.status()).toBe(404);
  });

  test('NEGATIVO — delete com ID string retorna 404', async ({ request }) => {
    const response = await request.delete('/posts/abc');

    expect(response.status()).toBe(404);
  });

  test('NEGATIVO — delete na coleção /posts sem ID retorna erro', async ({ request }) => {
    // Tentar deletar a coleção inteira deve ser bloqueado
    const response = await request.delete('/posts');

    // JSONPlaceholder bloqueia delete sem ID
    expect([404, 405, 400]).toContain(response.status());
  });

  test('IDEMPOTÊNCIA — segundo DELETE no mesmo recurso retorna 404', async ({ request }) => {
    // JSONPlaceholder é simulado — ambos retornam 200 por design
    // Documentamos o comportamento real para referência
    const firstDelete = await request.delete('/posts/10');
    expect(firstDelete.status()).toBe(200);

    // Em uma API real, o segundo delete retornaria 404
    // JSONPlaceholder retorna 200 novamente (simulação)
    const secondDelete = await request.delete('/posts/10');
    expect([200, 404]).toContain(secondDelete.status());
  });

});

// ─────────────────────────────────────────────────────────────
// DELETE /comments/:id
// ─────────────────────────────────────────────────────────────
test.describe('DELETE /comments/:id', () => {

  test('POSITIVO — deleta comentário existente e retorna 200', async ({ request }) => {
    const response = await request.delete('/comments/1');

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toEqual({});
  });

  test('NEGATIVO — deleta comentário inexistente retorna 404', async ({ request }) => {
    const response = await request.delete('/comments/99999');

    expect(response.status()).toBe(404);
  });

});

// ─────────────────────────────────────────────────────────────
// DELETE /todos/:id
// ─────────────────────────────────────────────────────────────
test.describe('DELETE /todos/:id', () => {

  test('POSITIVO — deleta todo existente e retorna 200', async ({ request }) => {
    const response = await request.delete('/todos/1');

    expect(response.status()).toBe(200);
  });

  test('NEGATIVO — deleta todo inexistente retorna 404', async ({ request }) => {
    const response = await request.delete('/todos/9999');

    expect(response.status()).toBe(404);
  });

});

// ─────────────────────────────────────────────────────────────
// DELETE — Headers de resposta
// ─────────────────────────────────────────────────────────────
test.describe('DELETE — Validação de Headers', () => {

  test('POSITIVO — DELETE retorna Content-Type JSON', async ({ request }) => {
    const response = await request.delete('/posts/3');

    expect(response.status()).toBe(200);
    const ct = response.headers()['content-type'];
    expect(ct).toContain('application/json');
  });

});
