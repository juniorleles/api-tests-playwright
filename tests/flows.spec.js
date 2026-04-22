/**
 * TAREFA 1 + 2 — Testes de Fluxo Completo (CRUD)
 * Combina GET + POST + PUT + PATCH + DELETE em sequência
 * Simula fluxos reais de uso da API
 */

const { test, expect } = require('@playwright/test');
const { VALID_POST_PAYLOAD } = require('../utils/helpers');

test.describe('Fluxo CRUD Completo — Posts', () => {

  test('POSITIVO — cria, lê, atualiza e deleta um post (fluxo completo)', async ({ request }) => {

    // 1. CREATE — POST /posts
    const createResponse = await request.post('/posts', {
      data: VALID_POST_PAYLOAD,
    });
    expect(createResponse.status()).toBe(201);
    const createdPost = await createResponse.json();
    expect(createdPost.id).toBeDefined();
    const postId = createdPost.id;

    // 2. READ — GET /posts/1 (JSONPlaceholder não persiste, usamos id=1 existente)
    const readResponse = await request.get('/posts/1');
    expect(readResponse.status()).toBe(200);
    const readPost = await readResponse.json();
    expect(readPost.id).toBe(1);

    // 3. UPDATE — PUT /posts/1
    const updateResponse = await request.put('/posts/1', {
      data: {
        id: 1,
        title: 'Título atualizado no fluxo CRUD',
        body: 'Body atualizado no fluxo CRUD',
        userId: 1,
      },
    });
    expect(updateResponse.status()).toBe(200);
    const updatedPost = await updateResponse.json();
    expect(updatedPost.title).toBe('Título atualizado no fluxo CRUD');

    // 4. PARTIAL UPDATE — PATCH /posts/1
    const patchResponse = await request.patch('/posts/1', {
      data: { title: 'Título final após PATCH' },
    });
    expect(patchResponse.status()).toBe(200);
    const patchedPost = await patchResponse.json();
    expect(patchedPost.title).toBe('Título final após PATCH');

    // 5. DELETE — DELETE /posts/1
    const deleteResponse = await request.delete('/posts/1');
    expect(deleteResponse.status()).toBe(200);
    const deletedBody = await deleteResponse.json();
    expect(deletedBody).toEqual({});
  });

});

test.describe('Fluxo — Criação e Listagem de Comments em Post', () => {

  test('POSITIVO — busca post, adiciona comentário e lista comentários do post', async ({ request }) => {

    // 1. Busca post existente
    const postResponse = await request.get('/posts/1');
    expect(postResponse.status()).toBe(200);
    const post = await postResponse.json();
    expect(post.id).toBe(1);

    // 2. Cria comentário nesse post
    const commentResponse = await request.post('/comments', {
      data: {
        postId: post.id,
        name: 'Comentário do fluxo de teste',
        email: 'fluxo@ofertahub.com.br',
        body: 'Este comentário foi criado durante o fluxo de teste automatizado',
      },
    });
    expect(commentResponse.status()).toBe(201);
    const comment = await commentResponse.json();
    expect(comment.postId).toBe(1);

    // 3. Lista comentários do post
    const listResponse = await request.get(`/comments?postId=${post.id}`);
    expect(listResponse.status()).toBe(200);
    const comments = await listResponse.json();
    expect(Array.isArray(comments)).toBe(true);
    expect(comments.length).toBeGreaterThan(0);
  });

});

test.describe('Fluxo — Busca e Filtragem Encadeada', () => {

  test('POSITIVO — busca usuário, lista posts dele e depois os comentários dos posts', async ({ request }) => {

    // 1. Busca usuário
    const userResponse = await request.get('/users/1');
    expect(userResponse.status()).toBe(200);
    const user = await userResponse.json();

    // 2. Lista posts do usuário
    const postsResponse = await request.get(`/posts?userId=${user.id}`);
    expect(postsResponse.status()).toBe(200);
    const posts = await postsResponse.json();
    expect(posts.length).toBeGreaterThan(0);
    posts.forEach(p => expect(p.userId).toBe(user.id));

    // 3. Busca comentários do primeiro post
    const firstPostId = posts[0].id;
    const commentsResponse = await request.get(`/comments?postId=${firstPostId}`);
    expect(commentsResponse.status()).toBe(200);
    const comments = await commentsResponse.json();
    expect(Array.isArray(comments)).toBe(true);
  });

});

test.describe('Fluxo Negativo — Sequência de Erros Encadeados', () => {

  test('NEGATIVO — tenta ler, atualizar e deletar recurso inexistente', async ({ request }) => {

    const INVALID_ID = 99999;

    // 1. GET — JSONPlaceholder retorna 404 para recursos inexistentes no GET
    const getResp = await request.get(`/posts/${INVALID_ID}`);
    expect(getResp.status()).toBe(404);

    // 2. PUT — JSONPlaceholder retorna 200, 404 ou 500 para PUT em inexistente
    const putResp = await request.put(`/posts/${INVALID_ID}`, {
      data: VALID_POST_PAYLOAD,
    });
    expect([200, 404, 500]).toContain(putResp.status());

    // 3. PATCH — JSONPlaceholder retorna 200 mesmo sem o recurso existir
    // (não valida existência — comportamento de API de produção seria 404)
    const patchResp = await request.patch(`/posts/${INVALID_ID}`, {
      data: { title: 'Tentativa' },
    });
    expect([200, 404, 500]).toContain(patchResp.status());

    // 4. DELETE — JSONPlaceholder retorna 200 para qualquer DELETE, inclusive inexistente
    // (comportamento de API de produção seria 404)
    const deleteResp = await request.delete(`/posts/${INVALID_ID}`);
    expect([200, 404]).toContain(deleteResp.status());
  });

});
