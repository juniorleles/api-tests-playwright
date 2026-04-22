/**
 * Helpers reutilizáveis para os testes de API
 */

/**
 * Valida headers comuns de uma resposta JSON
 * @param {import('@playwright/test').APIResponse} response
 * @param {import('@playwright/test').expect} expect
 */
async function validateJsonHeaders(response, expect) {
  const contentType = response.headers()['content-type'] || '';
  expect(contentType).toContain('application/json');
}

/**
 * Valida a estrutura de um Post da API
 * @param {object} post
 * @param {import('@playwright/test').expect} expect
 */
function validatePostStructure(post, expect) {
  expect(post).toHaveProperty('id');
  expect(post).toHaveProperty('title');
  expect(post).toHaveProperty('body');
  expect(post).toHaveProperty('userId');
  expect(typeof post.id).toBe('number');
  expect(typeof post.title).toBe('string');
  expect(typeof post.body).toBe('string');
  expect(typeof post.userId).toBe('number');
}

/**
 * Valida a estrutura de um User da API
 * @param {object} user
 * @param {import('@playwright/test').expect} expect
 */
function validateUserStructure(user, expect) {
  expect(user).toHaveProperty('id');
  expect(user).toHaveProperty('name');
  expect(user).toHaveProperty('email');
  expect(user).toHaveProperty('username');
  expect(typeof user.id).toBe('number');
  expect(typeof user.name).toBe('string');
  expect(typeof user.email).toBe('string');
}

/**
 * Valida a estrutura de um Comment da API
 * @param {object} comment
 * @param {import('@playwright/test').expect} expect
 */
function validateCommentStructure(comment, expect) {
  expect(comment).toHaveProperty('id');
  expect(comment).toHaveProperty('postId');
  expect(comment).toHaveProperty('name');
  expect(comment).toHaveProperty('email');
  expect(comment).toHaveProperty('body');
}

/**
 * Payload válido para criação de Post
 */
const VALID_POST_PAYLOAD = {
  title: 'Titulo do Post de Teste',
  body: 'Conteúdo do post criado pelo teste automatizado com Playwright',
  userId: 1,
};

/**
 * Payload válido para criação de Comment
 */
const VALID_COMMENT_PAYLOAD = {
  postId: 1,
  name: 'Comentário de Teste',
  email: 'teste@ofertahub.com.br',
  body: 'Corpo do comentário de teste automatizado',
};

module.exports = {
  validateJsonHeaders,
  validatePostStructure,
  validateUserStructure,
  validateCommentStructure,
  VALID_POST_PAYLOAD,
  VALID_COMMENT_PAYLOAD,
};
