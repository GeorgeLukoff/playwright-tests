import { test, expect } from "@playwright/test";
import { PactV3, MatchersV3 } from "@pact-foundation/pact";
import path from "path";
import http from "http";
import fs from "fs";
import { AddressInfo } from "net";

// --- tiny static server (serve ./app) ---
function startStaticServer(rootDir: string) {
  const srv = http.createServer((req, res) => {
    // normalize path
    const urlPath = (req.url || "/").split("?")[0];
    const safePath = urlPath === "/" ? "/index.html" : urlPath;
    const filePath = path.join(rootDir, safePath);

    // basic content-type mapping
    const ext = path.extname(filePath);
    const type =
      ext === ".html"
        ? "text/html"
        : ext === ".js"
          ? "application/javascript"
          : ext === ".css"
            ? "text/css"
            : ext === ".json"
              ? "application/json"
              : "application/octet-stream";

    fs.readFile(filePath, (err, buf) => {
      if (err) {
        res.statusCode = 404;
        res.setHeader("Content-Type", "text/plain");
        res.end("Not found");
        return;
      }
      res.statusCode = 200;
      res.setHeader("Content-Type", type);
      res.end(buf);
    });
  });

  return new Promise<{ server: http.Server; baseUrl: string }>((resolve) => {
    srv.listen(0, "127.0.0.1", () => {
      const { port } = srv.address() as AddressInfo;
      resolve({ server: srv, baseUrl: `http://127.0.0.1:${port}` });
    });
  });
}

test.describe("User Service Consumer Pact Test", () => {
  const provider = new PactV3({
    consumer: "FrontendApp",
    provider: "UserService",
    port: 1234,
    dir: path.resolve(process.cwd(), "pacts"),
    logLevel: "info",
  });

  const EXPECTED_USER = {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
  };

  let server: http.Server;
  let baseUrl: string;

  test.beforeAll(async () => {
    const started = await startStaticServer(path.resolve(__dirname, "app"));
    server = started.server;
    baseUrl = started.baseUrl;
  });

  test.afterAll(async () => {
    await new Promise<void>((r) => server.close(() => r()));
  });

  test("fetches user data and displays it", async ({ page }) => {
    // Pact interaction (don’t overspec headers unless your app really sends them)
    provider.addInteraction({
      states: [{ description: "a user with ID 1 exists" }],
      uponReceiving: "a request for user with ID 1",
      withRequest: {
        method: "GET",
        path: "/users/1",
      },
      willRespondWith: {
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: MatchersV3.equal(EXPECTED_USER),
      },
    });

    await provider.executeTest(async (mockServer) => {
      // Route the app’s backend call to Pact
      await page.route("**/users/1", (route) =>
        route.continue({ url: `${mockServer.url}/users/1` })
      );

      // (optional) debug what the page actually requests
      page.on("request", (req) => {
        if (req.url().includes("/users/1")) {
          console.log("→ page requested:", req.method(), req.url());
        }
      });

      // Serve over HTTP, not file://
      await page.goto(`${baseUrl}/index.html`);

      await page.click("#fetchUser");
      await page.waitForSelector("#userDetails:has-text('ID: 1')");

      const userDetails = await page.textContent("#userDetails");
      expect(userDetails).toContain("ID: 1");
      expect(userDetails).toContain("Name: John Doe");
      expect(userDetails).toContain("Email: john.doe@example.com");
    });
  });
});
