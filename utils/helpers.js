/**
 * Helpers reutilizáveis para os testes de API
 */

const { validatePostContract, validateCommentContract, validateUserContract } = require('../contracts/schemas');

// ─────────────────────────────────────────────────────────────
// Validadores de Headers
// ─────────────────────────────────────────────────────────────

/**
 * Valida headers comuns de uma resposta JSON
 */
async function validateJsonHeaders(response, expect) {
  const contentType = response.headers()['content-type'] || '';
  expect(contentType).toContain('application/json');
}

// ─────────────────────────────────────────────────────────────
// Validadores de Estrutura (mantidos por compatibilidade)
// Para novos testes, prefira usar validatePostContract etc. de contracts/schemas.js
// ─────────────────────────────────────────────────────────────

function validatePostStructure(post, expect) {
  validatePostContract(post, expect);
}

function validateUserStructure(user, expect) {
  validateUserContract(user, expect);
}

function validateCommentStructure(comment, expect) {
  validateCommentContract(comment, expect);
}

// ─────────────────────────────────────────────────────────────
// Payloads
// ─────────────────────────────────────────────────────────────

/**
 * Payload válido e completo para criação de Post
 */
const VALID_POST_PAYLOAD = {
  title: 'Titulo do Post de Teste',
  body: 'Conteúdo do post criado pelo teste automatizado com Playwright',
  userId: 1,
};

/**
 * Payload válido e completo para criação de Comment
 */
const VALID_COMMENT_PAYLOAD = {
  postId: 1,
  name: 'Comentário de Teste',
  email: 'teste@ofertahub.com.br',
  body: 'Corpo do comentário de teste automatizado',
};

/**
 * Payload válido para criação de Todo
 */
const VALID_TODO_PAYLOAD = {
  userId: 1,
  title: 'Tarefa de teste automatizado',
  completed: false,
};

/**
 * Payload válido para criação de User
 */
const VALID_USER_PAYLOAD = {
  name: 'Usuário de Teste',
  username: 'usuario_teste',
  email: 'usuario@ofertahub.com.br',
  phone: '11-99999-9999',
  website: 'ofertahub.com.br',
  address: {
    street: 'Rua dos Testes',
    suite: 'Ap 1',
    city: 'São Paulo',
    zipcode: '01310-100',
    geo: { lat: '-23.5505', lng: '-46.6333' },
  },
  company: {
    name: 'OfertaHub',
    catchPhrase: 'Testes de qualidade',
    bs: 'automation testing',
  },
};

/**
 * Gera um payload de post com campos customizáveis
 * @param {Partial<typeof VALID_POST_PAYLOAD>} overrides
 */
function buildPostPayload(overrides = {}) {
  return { ...VALID_POST_PAYLOAD, ...overrides };
}

/**
 * Gera um payload de comment com campos customizáveis
 * @param {Partial<typeof VALID_COMMENT_PAYLOAD>} overrides
 */
function buildCommentPayload(overrides = {}) {
  return { ...VALID_COMMENT_PAYLOAD, ...overrides };
}

module.exports = {
  validateJsonHeaders,
  validatePostStructure,
  validateUserStructure,
  validateCommentStructure,
  VALID_POST_PAYLOAD,
  VALID_COMMENT_PAYLOAD,
  VALID_TODO_PAYLOAD,
  VALID_USER_PAYLOAD,
  buildPostPayload,
  buildCommentPayload,
};
