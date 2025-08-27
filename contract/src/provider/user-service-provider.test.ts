import { test } from "@playwright/test";
import { Verifier, type VerifierOptions } from "@pact-foundation/pact";
import path from "path";
import { setupUser } from "./user-service";

interface User {
  id: number;
  name: string;
  email: string;
}

test.describe("User Service Provider Pact Verification", () => {
  test("verifies the provider contract", async () => {
    const opts: VerifierOptions = {
      provider: "UserService",
      providerBaseUrl: "http://localhost:3001",
      pactUrls: [
        path.resolve(process.cwd(), "pacts/FrontendApp-UserService.json"),
      ],
      stateHandlers: {
        "a user with ID 1 exists": async () => {
          await setupUser({
            id: 1,
            name: "John Doe",
            email: "john.doe@example.com",
          });
          // returning a POJO is optional; empty is fine
          return { description: "User with ID 1 created" };
        },
      },
      logLevel: "info" as const, // literal, not a generic string
    };

    await new Verifier(opts).verifyProvider();
    console.log("Provider verification successful");
  });
});
