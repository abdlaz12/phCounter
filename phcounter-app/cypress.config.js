const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    // Ganti ke https://ph-counter.vercel.app untuk test di production
    baseUrl: "https://ph-counter.vercel.app",
    specPattern: "cypress/e2e/**/*.cy.js",
    supportFile: "cypress/support/e2e.js",
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 30000,
    setupNodeEvents(on, config) {
      // Node event listeners bisa ditambahkan di sini
    },
  },
});
