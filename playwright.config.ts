import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
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
      testDir: "api/pet-store/tests",
      testMatch: ["**/*.spec.ts"],
      use: {
        baseURL: "https://petstore.swagger.io/v2",
        extraHTTPHeaders: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
      retries: 1,
    },
    {
      name: "db",
      testDir: "./db/tests",
      retries: 1,
      use: {},
    },
  ],

  outputDir: "test-results",
  snapshotDir: "__snapshots__",
});
