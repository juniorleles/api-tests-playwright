/**
 * Contratos de Schema da API — JSONPlaceholder
 *
 * Define a estrutura esperada de cada recurso.
 * Usado pelos testes para validar contratos de forma centralizada.
 */

/**
 * Valida um objeto contra um schema de contrato.
 * Lança erro descritivo se algum campo falhar.
 *
 * @param {object} data - Objeto recebido da API
 * @param {object} schema - Schema com { campo: tipo }
 * @param {Function} expect - Função expect do Playwright
 * @param {string} [label] - Nome do recurso para mensagens de erro
 */
function validateSchema(data, schema, expect, label = 'objeto') {
  for (const [field, type] of Object.entries(schema)) {
    expect(
      data,
      `Contrato violado: campo "${field}" ausente em ${label}`
    ).toHaveProperty(field);

    expect(
      typeof data[field],
      `Contrato violado: "${field}" deveria ser "${type}", recebeu "${typeof data[field]}" em ${label}`
    ).toBe(type);
  }
}

// ─────────────────────────────────────────────────────────────
// Schemas
// ─────────────────────────────────────────────────────────────

const POST_SCHEMA = {
  id: 'number',
  title: 'string',
  body: 'string',
  userId: 'number',
};

const COMMENT_SCHEMA = {
  id: 'number',
  postId: 'number',
  name: 'string',
  email: 'string',
  body: 'string',
};

const USER_SCHEMA = {
  id: 'number',
  name: 'string',
  username: 'string',
  email: 'string',
  phone: 'string',
  website: 'string',
};

const USER_ADDRESS_SCHEMA = {
  street: 'string',
  suite: 'string',
  city: 'string',
  zipcode: 'string',
};

const USER_GEO_SCHEMA = {
  lat: 'string',
  lng: 'string',
};

const USER_COMPANY_SCHEMA = {
  name: 'string',
  catchPhrase: 'string',
  bs: 'string',
};

const TODO_SCHEMA = {
  id: 'number',
  userId: 'number',
  title: 'string',
  completed: 'boolean',
};

const ALBUM_SCHEMA = {
  id: 'number',
  userId: 'number',
  title: 'string',
};

const PHOTO_SCHEMA = {
  id: 'number',
  albumId: 'number',
  title: 'string',
  url: 'string',
  thumbnailUrl: 'string',
};

// ─────────────────────────────────────────────────────────────
// Validadores compostos
// ─────────────────────────────────────────────────────────────

/**
 * Valida contrato completo de Post
 */
function validatePostContract(post, expect) {
  validateSchema(post, POST_SCHEMA, expect, 'Post');

  expect(post.id, 'Post.id deve ser positivo').toBeGreaterThan(0);
  expect(post.userId, 'Post.userId deve ser positivo').toBeGreaterThan(0);
  expect(post.title.trim(), 'Post.title não pode ser vazio').not.toBe('');
  expect(post.body.trim(), 'Post.body não pode ser vazio').not.toBe('');
}

/**
 * Valida contrato completo de Comment
 */
function validateCommentContract(comment, expect) {
  validateSchema(comment, COMMENT_SCHEMA, expect, 'Comment');

  expect(comment.id, 'Comment.id deve ser positivo').toBeGreaterThan(0);
  expect(comment.postId, 'Comment.postId deve ser positivo').toBeGreaterThan(0);
  expect(comment.email, 'Comment.email deve ser válido').toMatch(
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  );
  expect(comment.name.trim(), 'Comment.name não pode ser vazio').not.toBe('');
  expect(comment.body.trim(), 'Comment.body não pode ser vazio').not.toBe('');
}

/**
 * Valida contrato completo de User (com objetos aninhados)
 */
function validateUserContract(user, expect) {
  validateSchema(user, USER_SCHEMA, expect, 'User');

  expect(user.id, 'User.id deve ser positivo').toBeGreaterThan(0);
  expect(user.email, 'User.email deve ser válido').toMatch(
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  );

  // Objeto aninhado: address
  expect(user, 'User deve ter address').toHaveProperty('address');
  validateSchema(user.address, USER_ADDRESS_SCHEMA, expect, 'User.address');

  // Objeto aninhado: address.geo
  expect(user.address, 'User.address deve ter geo').toHaveProperty('geo');
  validateSchema(user.address.geo, USER_GEO_SCHEMA, expect, 'User.address.geo');

  // Objeto aninhado: company
  expect(user, 'User deve ter company').toHaveProperty('company');
  validateSchema(user.company, USER_COMPANY_SCHEMA, expect, 'User.company');
}

/**
 * Valida contrato de Todo
 */
function validateTodoContract(todo, expect) {
  validateSchema(todo, TODO_SCHEMA, expect, 'Todo');

  expect(todo.id, 'Todo.id deve ser positivo').toBeGreaterThan(0);
  expect(todo.userId, 'Todo.userId deve ser positivo').toBeGreaterThan(0);
}

/**
 * Valida contrato de Album
 */
function validateAlbumContract(album, expect) {
  validateSchema(album, ALBUM_SCHEMA, expect, 'Album');
}

/**
 * Valida contrato de Photo
 */
function validatePhotoContract(photo, expect) {
  validateSchema(photo, PHOTO_SCHEMA, expect, 'Photo');

  expect(photo.url, 'Photo.url deve ser uma URL válida').toMatch(/^https?:\/\//);
  expect(photo.thumbnailUrl, 'Photo.thumbnailUrl deve ser uma URL válida').toMatch(/^https?:\/\//);
}

module.exports = {
  validateSchema,
  validatePostContract,
  validateCommentContract,
  validateUserContract,
  validateTodoContract,
  validateAlbumContract,
  validatePhotoContract,
  // Schemas exportados para uso direto quando necessário
  POST_SCHEMA,
  COMMENT_SCHEMA,
  USER_SCHEMA,
  TODO_SCHEMA,
  ALBUM_SCHEMA,
  PHOTO_SCHEMA,
};
