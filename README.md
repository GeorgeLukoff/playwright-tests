# **Playwright Test Suite**

This repository contains Playwright-powered test suites for:

* **UI Tests (e2e/todos)**: End-to-end tests for the [TodoMVC demo app](https://demo.playwright.dev/todomvc/#/).  
* **API Tests (api/pet-store)**: API tests for the [Swagger Petstore API](https://petstore.swagger.io/v2).

---

## **🔧 Setup & Installation**

## **Step-by-step**

`mkdir my-project && cd my-project`  
`npm init -y`

**Install Playwright Test runner (with browsers)**  
`npm install -D @playwright/test`  
`npx playwright install`

First command adds the test runner. Second command downloads browser binaries (Chromium, Firefox, WebKit).

**Install TypeScript \+ helpers**  
`npm install -D typescript ts-node @types/node`

**Generate `tsconfig.json`**  
 `npx tsc --init`

 Then tweak it minimally:  
 `{`  
  `"compilerOptions": {`  
    `"target": "ESNext",`  
    `"module": "CommonJS",`  
    `"strict": true,`  
    `"esModuleInterop": true,`  
    `"skipLibCheck": true,`  
    `"forceConsistentCasingInFileNames": true,`  
    `"outDir": "dist"`  
  `}`  
`}`

**Generate Playwright config:**  
 `npx playwright test --init`  
This creates `playwright.config.ts` in the root. It may also drop a sample test — you can delete it.

---

## **▶️ Running the Tests**

### **Using npm Scripts**

Add these to your package.json:  
{  
  "scripts": {  
    "test": "playwright test",  
    "test:ui": "playwright test \--project=chromium",  
    "test:ui:all": "playwright test \--project=chromium \--project=firefox \--project=webkit",  
    "test:api": "playwright test \--project=api",  
    "test:report": "playwright show-report"  
  }  
}

Run commands:  
npm test              *\# Run all tests (UI \+ API)*  
npm run test:ui       *\# Run UI tests (Chromium only)*  
npm run test:ui:all   *\# Run UI tests (Chromium, Firefox, WebKit)*  
npm run test:api      *\# Run API tests*  
npm run test:report   *\# View HTML report*

### **Using Playwright CLI**

npx playwright test                       *\# All tests*  
npx playwright test \--project=chromium    *\# UI tests (Chromium)*  
npx playwright test \--project=api         *\# API tests*  
npx playwright test \--project=chromium \--headed \--debug  *\# Debug mode*  
npx playwright show-report                *\# View HTML report*

### **List Tests**

npx playwright test \--project=api \--list  
---

## **📂 Project Structure**

e2e/todos/             \# UI tests  
├── tests/             \# Test spec files  
├── pages/             \# Page Object Models  
├── helpers/           \# Test utilities  
└── data/              \# Test data  
api/pet-store/         \# API tests  
└── tests/             \# API test specs  
playwright.config.ts   \# Playwright configuration  
tsconfig.json          \# TypeScript configuration  
package.json  
README.md  
---

## **🛠️ Design Decisions**

* **UI Tests:** Use the Page Object Model (POM) for maintainability. For single-page applications like TodoMVC, I also adopt a modular approach to keep the code concise and avoid over-engineering.  
* **API Tests**: Leverage Playwright’s request fixture with project-specific baseURL and headers.  
* **Configuration**: playwright.config.ts defines projects (chromium, firefox, webkit, api) with distinct testMatch and baseURL.  
* **Reporting**:  
  * list: Console output for CI.  
  * html: Local debugging (playwright-report/).  
  * junit: CI integration (test-results/results.xml).  
* **Retries**:  
  * UI: 2 retries on CI to handle flakiness.  
  * API: 1 retry.  
* **Parallelism**: Tests run fully parallel where safe.  
* **Snapshots**: UI snapshot tests (toMatchSnapshot, toHaveScreenshot) use snapshotDir.


### **Assumptions**

* TodoMVC (https://demo.playwright.dev/todomvc/\#/) is stable.  
* Swagger Petstore (https://petstore.swagger.io/v2) is available, but responses may be flaky due to its public nature.

---

## **🏗️ CI: GitHub Actions**

Add this workflow to .github/workflows/playwright.yml:

name: Playwright Tests  
on:  
  push:  
    branches: \[main\]  
  pull\_request:  
    branches: \[main\]  
jobs:  
  setup:  
    runs-on: ubuntu-latest  
    outputs:  
      node-cache-hit: ${{ steps.cache-node.outputs.cache-hit }}  
    steps:  
      \- uses: actions/checkout@v4  
      \- uses: actions/setup-node@v4  
        with:  
          node-version: 20  
          cache: 'npm'  
      \- run: npm ci  
      \- run: npx playwright install \--with-deps  
      \- id: cache-node  
        uses: actions/cache@v4  
        with:  
          path: |  
            node\_modules  
            \~/.cache/ms-playwright  
          key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}  
  ui:  
    name: UI (${{ matrix.project }})  
    needs: setup  
    runs-on: ubuntu-latest  
    strategy:  
      fail-fast: false  
      matrix:  
        project: \[chromium, firefox, webkit\]  
    steps:  
      \- uses: actions/checkout@v4  
      \- uses: actions/setup-node@v4  
        with:  
          node-version: 20  
          cache: 'npm'  
      \- uses: actions/cache@v4  
        with:  
          path: |  
            node\_modules  
            \~/.cache/ms-playwright  
          key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}  
      \- run: npx playwright test \--project=${{ matrix.project }}  
      \- if: always()  
        uses: actions/upload-artifact@v4  
        with:  
          name: playwright-report-${{ matrix.project }}  
          path: playwright-report  
          retention-days: 7  
      \- if: always()  
        uses: actions/upload-artifact@v4  
        with:  
          name: test-results-${{ matrix.project }}  
          path: test-results  
          retention-days: 7  
  api:  
    name: API  
    needs: setup  
    runs-on: ubuntu-latest  
    steps:  
      \- uses: actions/checkout@v4  
      \- uses: actions/setup-node@v4  
        with:  
          node-version: 20  
          cache: 'npm'  
      \- uses: actions/cache@v4  
        with:  
          path: |  
            node\_modules  
            \~/.cache/ms-playwright  
          key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}  
      \- run: npx playwright test \--project=api  
      \- if: always()  
        uses: actions/upload-artifact@v4  
        with:  
          name: playwright-report-api  
          path: playwright-report  
          retention-days: 7  
      \- if: always()  
        uses: actions/upload-artifact@v4  
        with:  
          name: test-results-api  
          path: test-results  
          retention-days: 7

### **What It Does**

* **Matrix for UI**: Runs chromium, firefox, and webkit in parallel.  
* **API Job**: Runs api project separately.  
* **Artifacts**: Saves playwright-report/ (HTML) and test-results/ (JUnit, traces, screenshots).  
* **Caching**: Speeds up builds with npm and Playwright browser caching.  
* **Retries**: Uses playwright.config.ts retry settings.

### **CI Tips**

* Download playwright-report-\* artifacts and open index.html for HTML reports.  
* JUnit results are in test-results/results.xml.  
* Update branches: \[main\] if your default branch differs.

---

## **🧯 Troubleshooting CI**

1. **"No tests found"**:  
   * Verify testMatch/testDir in playwright.config.ts.  
   * Check with: npx playwright test \--project=api \--list.  
   * Ensure tsconfig.json includes test paths:  
     { "include": \["playwright.config.ts", "e2e/todos/\*\*/\*.ts", "api/pet-store/tests/\*\*/\*.ts"\]}

2. **WebKit/Firefox missing dependencies**:  
   * Use npx playwright install \--with-deps (already in workflow).  
   * Ensure Ubuntu runner isn’t too minimal.  
3. **Flaky UI tests**:  
   * Retries are enabled (2x for UI).  
   * Enable traces/screenshots: trace: "retain-on-failure", screenshot: "only-on-failure".  
   * Debug traces: npx playwright show-trace test-results/trace.zip.  
4. **API flakiness (Petstore)**:  
   * Handle 5xx/429 errors with retries (set to 1 for API).  
   * Increase timeouts: timeout: 45000, expect: { timeout: 15000 }.  
5. **Wrong baseURL**:  
   * UI: https://demo.playwright.dev/todomvc/\#/.  
   * API: https://petstore.swagger.io/v2.  
   * Verify in playwright.config.ts.  
6. **Timeouts**:

   CI is slower than local. Set:  
   timeout: 45000,

   use: { actionTimeout: 20000, navigationTimeout: 30000 }

7. **Resource contention**:  
   * Limit workers in CI: workers: process.env.CI ? 1 : undefined.  
8. **Large artifacts**:  
   * Reduce size: trace: "on-first-retry", video: "retain-on-failure".  
   * Set retention: retention-days: 3\.  
9. **Debugging failures**:  
   * Re-run failed project: npx playwright test \--project=chromium \--repeat-each=1 \--retries=0.  
   * Debug locally: npx playwright test \--project=chromium \--headed \--debug.

---

## **📌 Notes**

* **UI Debugging**: Run in headed mode (--headed \--debug) for selector issues.  
* **Test Data**: Clean up Todos via helpers for idempotency.  
* **API Tests**: Shared Petstore environment may cause non-deterministic results.

---

