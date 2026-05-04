/**
 * Testes DELETE
 * Endpoint: /posts/:id, /comments/:id, /todos/:id
 *
 * NOTA: JSONPlaceholder retorna 200 para qualquer DELETE, mesmo IDs inválidos.
 * Testes negativos documentam esse comportamento real vs. o esperado em produção.
 *
 * Melhorias aplicadas:
 * - Assertions com mensagens descritivas
 * - Validação do contrato de resposta vazia
 * - Organização de cenários por categoria
 */

const { test, expect } = require('@playwright/test');

// ─────────────────────────────────────────────────────────────
// DELETE /posts/:id
// ─────────────────────────────────────────────────────────────
test.describe('DELETE /posts/:id', () => {

  test('POSITIVO — deleta post existente, retorna 200 e corpo vazio', async ({ request }) => {
    const response = await request.delete('/posts/1');

    expect(response.status(), 'DELETE deve retornar 200').toBe(200);
    const body = await response.json();
    expect(body, 'Corpo do DELETE deve ser objeto vazio').toEqual({});
    expect(Object.keys(body).length, 'Não deve retornar campos do recurso deletado').toBe(0);
  });

  test('POSITIVO — deleta post do meio da lista (id=50)', async ({ request }) => {
    const response = await request.delete('/posts/50');
    expect(response.status()).toBe(200);
  });

  test('POSITIVO — deleta último post (id=100)', async ({ request }) => {
    const response = await request.delete('/posts/100');
    expect(response.status()).toBe(200);
  });

  test('NEGATIVO — delete em ID inexistente: JSONPlaceholder retorna 200 (produção deveria retornar 404)', async ({ request }) => {
    const response = await request.delete('/posts/99999');
    expect(response.status(), 'JSONPlaceholder não valida existência — retorna 200').toBe(200);
    expect(await response.json()).toEqual({});
  });

  test('NEGATIVO — delete com ID zero: JSONPlaceholder retorna 200 (produção deveria retornar 400/404)', async ({ request }) => {
    const response = await request.delete('/posts/0');
    expect(response.status()).toBe(200);
  });

  test('NEGATIVO — delete com ID negativo: JSONPlaceholder retorna 200 (produção deveria retornar 400)', async ({ request }) => {
    const response = await request.delete('/posts/-5');
    expect(response.status()).toBe(200);
  });

  test('NEGATIVO — delete com ID string: JSONPlaceholder retorna 200 (produção deveria retornar 400)', async ({ request }) => {
    const response = await request.delete('/posts/abc');
    expect(response.status()).toBe(200);
  });

  test('NEGATIVO — delete na coleção /posts sem ID retorna erro', async ({ request }) => {
    const response = await request.delete('/posts');
    expect([404, 405, 400], 'DELETE sem ID deve retornar erro').toContain(response.status());
  });

  test('IDEMPOTÊNCIA — JSONPlaceholder retorna 200 em ambos os DELETEs (sem persistência real)', async ({ request }) => {
    const first = await request.delete('/posts/10');
    expect(first.status(), 'Primeiro DELETE deve retornar 200').toBe(200);

    // JSONPlaceholder não persiste — produção retornaria 404 no segundo DELETE
    const second = await request.delete('/posts/10');
    expect(second.status(), 'JSONPlaceholder repete 200 sem persistência').toBe(200);
  });

});

// ─────────────────────────────────────────────────────────────
// DELETE /comments/:id
// ─────────────────────────────────────────────────────────────
test.describe('DELETE /comments/:id', () => {

  test('POSITIVO — deleta comentário existente e retorna 200 com corpo vazio', async ({ request }) => {
    const response = await request.delete('/comments/1');

    expect(response.status()).toBe(200);
    expect(await response.json(), 'Corpo deve ser objeto vazio').toEqual({});
  });

  test('NEGATIVO — delete em comentário inexistente: JSONPlaceholder retorna 200 (produção deveria retornar 404)', async ({ request }) => {
    const response = await request.delete('/comments/99999');

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({});
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

  test('NEGATIVO — delete em todo inexistente: JSONPlaceholder retorna 200 (produção deveria retornar 404)', async ({ request }) => {
    const response = await request.delete('/todos/9999');
    expect(response.status()).toBe(200);
  });

});

// ─────────────────────────────────────────────────────────────
// DELETE — Validação de Headers
// ─────────────────────────────────────────────────────────────
test.describe('DELETE — Validação de Headers', () => {

  test('POSITIVO — DELETE retorna Content-Type JSON', async ({ request }) => {
    const response = await request.delete('/posts/3');

    expect(response.status()).toBe(200);
    expect(
      response.headers()['content-type'],
      'Content-Type deve ser application/json'
    ).toContain('application/json');
  });

});
