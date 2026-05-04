/**
 * Testes de Fluxo Completo (CRUD)
 * Combina GET + POST + PUT + PATCH + DELETE em sequência
 *
 * Melhorias aplicadas:
 * - Validação por contrato em cada etapa do fluxo
 * - Assertions descritivas com contexto de qual etapa falhou
 * - Uso de buildPostPayload para payloads variados
 */

const { test, expect } = require('@playwright/test');
const { VALID_POST_PAYLOAD, buildPostPayload, buildCommentPayload } = require('../utils/helpers');
const { validatePostContract, validateCommentContract, validateUserContract } = require('../contracts/schemas');

// ─────────────────────────────────────────────────────────────
// Fluxo CRUD Completo
// ─────────────────────────────────────────────────────────────
test.describe('Fluxo CRUD Completo — Posts', () => {

  test('POSITIVO — cria, lê, atualiza (PUT), atualiza (PATCH) e deleta um post', async ({ request }) => {

    // 1. CREATE
    const createResponse = await request.post('/posts', { data: VALID_POST_PAYLOAD });
    expect(createResponse.status(), '[CRUD:1-CREATE] Deve retornar 201').toBe(201);
    const createdPost = await createResponse.json();
    expect(createdPost.id, '[CRUD:1-CREATE] Deve retornar id gerado').toBeDefined();
    validatePostContract(createdPost, expect);

    // 2. READ (JSONPlaceholder não persiste, lemos id=1 existente)
    const readResponse = await request.get('/posts/1');
    expect(readResponse.status(), '[CRUD:2-READ] Deve retornar 200').toBe(200);
    const readPost = await readResponse.json();
    validatePostContract(readPost, expect);
    expect(readPost.id, '[CRUD:2-READ] Deve retornar o post correto').toBe(1);

    // 3. UPDATE completo — PUT
    const putPayload = buildPostPayload({ id: 1, title: 'Título atualizado no fluxo CRUD via PUT' });
    const updateResponse = await request.put('/posts/1', { data: putPayload });
    expect(updateResponse.status(), '[CRUD:3-PUT] Deve retornar 200').toBe(200);
    const updatedPost = await updateResponse.json();
    validatePostContract(updatedPost, expect);
    expect(updatedPost.title, '[CRUD:3-PUT] Title deve refletir o update').toBe(putPayload.title);

    // 4. UPDATE parcial — PATCH
    const patchResponse = await request.patch('/posts/1', {
      data: { title: 'Título final após PATCH no fluxo CRUD' },
    });
    expect(patchResponse.status(), '[CRUD:4-PATCH] Deve retornar 200').toBe(200);
    const patchedPost = await patchResponse.json();
    expect(patchedPost.title, '[CRUD:4-PATCH] Title deve refletir o PATCH').toBe('Título final após PATCH no fluxo CRUD');
    expect(patchedPost, '[CRUD:4-PATCH] Body deve ser preservado').toHaveProperty('body');

    // 5. DELETE
    const deleteResponse = await request.delete('/posts/1');
    expect(deleteResponse.status(), '[CRUD:5-DELETE] Deve retornar 200').toBe(200);
    const deletedBody = await deleteResponse.json();
    expect(deletedBody, '[CRUD:5-DELETE] Corpo deve ser vazio').toEqual({});
  });

});

// ─────────────────────────────────────────────────────────────
// Fluxo: Post → Comment
// ─────────────────────────────────────────────────────────────
test.describe('Fluxo — Criação e Listagem de Comments em Post', () => {

  test('POSITIVO — busca post, cria comentário, lista comentários e valida contratos', async ({ request }) => {

    // 1. Busca post existente e valida contrato
    const postResponse = await request.get('/posts/1');
    expect(postResponse.status(), '[FLOW:1] GET post deve retornar 200').toBe(200);
    const post = await postResponse.json();
    validatePostContract(post, expect);

    // 2. Cria comentário nesse post
    const commentPayload = buildCommentPayload({ postId: post.id });
    const commentResponse = await request.post('/comments', { data: commentPayload });
    expect(commentResponse.status(), '[FLOW:2] POST comment deve retornar 201').toBe(201);
    const comment = await commentResponse.json();
    expect(comment.postId, '[FLOW:2] postId deve ser o do post buscado').toBe(1);

    // 3. Lista comentários e valida contrato de cada um
    const listResponse = await request.get(`/comments?postId=${post.id}`);
    expect(listResponse.status(), '[FLOW:3] GET comments deve retornar 200').toBe(200);
    const comments = await listResponse.json();
    expect(Array.isArray(comments), '[FLOW:3] Deve retornar array').toBe(true);
    expect(comments.length, '[FLOW:3] Deve ter ao menos um comentário').toBeGreaterThan(0);
    comments.forEach(c => validateCommentContract(c, expect));
  });

});

// ─────────────────────────────────────────────────────────────
// Fluxo: User → Posts → Comments
// ─────────────────────────────────────────────────────────────
test.describe('Fluxo — Busca e Filtragem Encadeada', () => {

  test('POSITIVO — busca usuário, lista posts dele e valida comentários do primeiro post', async ({ request }) => {

    // 1. Busca usuário e valida contrato completo (com objetos aninhados)
    const userResponse = await request.get('/users/1');
    expect(userResponse.status(), '[CHAIN:1] GET user deve retornar 200').toBe(200);
    const user = await userResponse.json();
    validateUserContract(user, expect);

    // 2. Lista posts do usuário e valida contrato de cada um
    const postsResponse = await request.get(`/posts?userId=${user.id}`);
    expect(postsResponse.status(), '[CHAIN:2] GET posts deve retornar 200').toBe(200);
    const posts = await postsResponse.json();
    expect(posts.length, '[CHAIN:2] Usuário deve ter posts').toBeGreaterThan(0);
    posts.forEach(p => {
      expect(p.userId, `[CHAIN:2] Post deve pertencer ao userId=${user.id}`).toBe(user.id);
      validatePostContract(p, expect);
    });

    // 3. Busca comentários do primeiro post e valida contrato
    const firstPostId = posts[0].id;
    const commentsResponse = await request.get(`/comments?postId=${firstPostId}`);
    expect(commentsResponse.status(), '[CHAIN:3] GET comments deve retornar 200').toBe(200);
    const comments = await commentsResponse.json();
    expect(Array.isArray(comments), '[CHAIN:3] Deve retornar array').toBe(true);
    comments.forEach(c => validateCommentContract(c, expect));
  });

});

// ─────────────────────────────────────────────────────────────
// Fluxo Negativo
// ─────────────────────────────────────────────────────────────
test.describe('Fluxo Negativo — Sequência de Erros Encadeados', () => {

  test('NEGATIVO — tenta ler, atualizar e deletar recurso inexistente', async ({ request }) => {

    const INVALID_ID = 99999;

    // 1. GET — JSONPlaceholder retorna 404 para IDs inexistentes
    const getResp = await request.get(`/posts/${INVALID_ID}`);
    expect(getResp.status(), '[NEG:1] GET em ID inexistente deve ser 404').toBe(404);

    // 2. PUT — comportamento não determinístico no JSONPlaceholder
    const putResp = await request.put(`/posts/${INVALID_ID}`, { data: VALID_POST_PAYLOAD });
    expect([200, 404, 500], '[NEG:2] PUT em inexistente: 200/404/500').toContain(putResp.status());

    // 3. PATCH — JSONPlaceholder não valida existência
    const patchResp = await request.patch(`/posts/${INVALID_ID}`, { data: { title: 'Tentativa' } });
    expect([200, 404, 500], '[NEG:3] PATCH em inexistente: 200/404/500').toContain(patchResp.status());

    // 4. DELETE — JSONPlaceholder retorna 200 mesmo para IDs inexistentes
    const deleteResp = await request.delete(`/posts/${INVALID_ID}`);
    expect([200, 404], '[NEG:4] DELETE em inexistente: 200/404').toContain(deleteResp.status());
  });

});
