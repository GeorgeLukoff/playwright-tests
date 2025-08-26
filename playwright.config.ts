// // playwright.config.ts
// import { defineConfig, devices } from "@playwright/test";

// export default defineConfig({
//   // 👉 Point Playwright at your tests folder
//   testDir: "./e2e/todos/tests",

//   fullyParallel: true,
//   forbidOnly: !!process.env.CI,
//   retries: process.env.CI ? 2 : 0,
//   workers: process.env.CI ? 1 : undefined,

//   reporter: "html",
//   timeout: 30_000,
//   expect: { timeout: 10_000 },

//   use: {
//     baseURL: process.env.BASE_URL || "https://demo.playwright.dev/todomvc/#/",
//     headless: true,
//     actionTimeout: 15_000,
//     navigationTimeout: 20_000,
//     trace: "on-first-retry",
//     screenshot: "only-on-failure",
//     video: "retain-on-failure",
//   },

//   projects: [
//     { name: "chromium", use: { ...devices["Desktop Chrome"] } },
//     { name: "firefox", use: { ...devices["Desktop Firefox"] } },
//     { name: "webkit", use: { ...devices["Desktop Safari"] } },
//   ],

//   outputDir: "test-results",
//   snapshotDir: "__snapshots__",
// });

import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  // We want to run both the existing e2e folder and a new API specs folder.
  testDir: ".",

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ["list"],
    ["html", { open: "never" }], // keep default folder "playwright-report" to avoid mixing with outputDir
    ["junit", { outputFile: "test-results/results.xml" }],
  ],

  timeout: 30_000,
  expect: { timeout: 10_000 },

  use: {
    headless: true,
    actionTimeout: 15_000,
    navigationTimeout: 20_000,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      testMatch: ["e2e/todos/tests/**/*.ts"],
      use: {
        ...devices["Desktop Chrome"],
        baseURL:
          process.env.BASE_URL || "https://demo.playwright.dev/todomvc/#/",
      },
    },

    {
      name: "firefox",
      testMatch: ["e2e/todos/tests/**/*.ts"],
      use: {
        ...devices["Desktop Firefox"],
        baseURL:
          process.env.BASE_URL || "https://demo.playwright.dev/todomvc/#/",
      },
    },

    {
      name: "webkit",
      testMatch: ["e2e/todos/tests/**/*.ts"],
      use: {
        ...devices["Desktop Safari"],
        baseURL:
          process.env.BASE_URL || "https://demo.playwright.dev/todomvc/#/",
      },
    },

    {
      name: "api",
      // point to your actual folder
      testDir: "api/pet-store/tests",
      testMatch: ["**/*.spec.ts"], // matches userApi.spec.ts
      use: {
        baseURL: "https://petstore.swagger.io/v2",
        extraHTTPHeaders: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
      retries: 1,
    },
  ],

  outputDir: "test-results",
  snapshotDir: "__snapshots__",
});
