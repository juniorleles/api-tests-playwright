/**
 * Ambiente: QA
 * Troque a baseURL quando tiver um ambiente de QA real
 */
module.exports = {
  baseURL: 'https://jsonplaceholder.typicode.com',
  name: 'qa',
  extraHTTPHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};
