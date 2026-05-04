/**
 * Ambiente: PROD
 * Troque a baseURL quando necessário
 */
module.exports = {
  baseURL: 'https://jsonplaceholder.typicode.com',
  name: 'prod',
  extraHTTPHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};
