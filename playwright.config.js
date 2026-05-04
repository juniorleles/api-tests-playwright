// @ts-check
const { defineConfig } = require('@playwright/test');

/**
 * Carrega o ambiente via variável de ambiente ENV
 * Uso:
 *   ENV=dev npx playwright test
 *   ENV=qa npx playwright test
 *   ENV=prod npx playwright test
 *
 * Padrão: dev
 */
const ENV = process.env.ENV || 'dev';
const environment = require(`./environments/${ENV}`);

console.log(`\n🌍 Ambiente: ${environment.name.toUpperCase()} | URL: ${environment.baseURL}\n`);

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 1,
  workers: 2,

  reporter: [
    ['list'],
    ['html', { outputFolder: `reports/${ENV}/html`, open: 'never' }],
    ['json', { outputFile: `reports/${ENV}/results.json` }],
  ],

  use: {
    baseURL: environment.baseURL,
    extraHTTPHeaders: environment.extraHTTPHeaders,
  },

  projects: [
    {
      name: `API Tests [${ENV.toUpperCase()}]`,
      testMatch: '**/*.spec.js',
    },
  ],
});
