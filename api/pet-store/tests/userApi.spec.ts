import { test, expect } from "@playwright/test";
import { ApiHelper } from "../helpers/apiHelper.ts";
import { apiConfig } from "../config/apiConfig";

test.describe("Petstore User API Tests", () => {
  let apiHelper: ApiHelper;
  const user = apiConfig.defaultUser;
  const invalidUserId = 999999;
  const duplicateUser = { ...user, id: user.id + 1 };

  test.beforeEach(async ({ request }) => {
    apiHelper = new ApiHelper(request);
  });

  // Happy Path Tests
  test("POST /user - Create a new user", async () => {
    const response = await apiHelper.createUser(user);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.message).toBe(user.id.toString());
  });

  test("GET /user/{id} - Fetch user details", async () => {
    await apiHelper.createUser(user); // Setup
    const response = await apiHelper.getUser(user.id);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.username).toBe(user.username);
    expect(body.email).toBe(user.email);
  });

  test("DELETE /user/{id} - Delete a user", async () => {
    await apiHelper.createUser(user); // Setup
    const response = await apiHelper.deleteUser(user.id);
    expect(response.status()).toBe(200);
    // Verify deletion
    const getResponse = await apiHelper.getUser(user.id);
    expect(getResponse.status()).toBe(404);
  });

  test("POST /login - Authenticate user and get token", async () => {
    const response = await apiHelper.login(
      apiConfig.credentials.username,
      apiConfig.credentials.password
    );
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.message).toContain("logged in user session");
  });

  // Invalid Input and Error Code Tests
  test("POST /user - Invalid user data (missing fields)", async () => {
    const invalidUser = { id: user.id, username: "" }; // Missing required fields
    const response = await apiHelper.createUser(invalidUser);
    expect(response.status()).toBe(400); // Expect bad request
  });

  test("GET /user/{id} - Non-existent user", async () => {
    const response = await apiHelper.getUser(invalidUserId);
    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.message).toContain("User not found");
  });

  test("DELETE /user/{id} - Non-existent user", async () => {
    const response = await apiHelper.deleteUser(invalidUserId);
    expect(response.status()).toBe(404);
  });

  // Authenticated vs. Unauthenticated Access
  test("DELETE /user/{id} - Authenticated delete", async () => {
    await apiHelper.createUser(user); // Setup
    const loginResponse = await apiHelper.login(
      apiConfig.credentials.username,
      apiConfig.credentials.password
    );
    const loginBody = await loginResponse.json();
    const token = loginBody.message.match(/session:(\w+)/)?.[1] || "";

    const response = await apiHelper.deleteUser(user.id, token);
    expect(response.status()).toBe(200);
  });

  test("DELETE /user/{id} - Unauthenticated delete (no token)", async () => {
    await apiHelper.createUser(user); // Setup
    const response = await apiHelper.deleteUser(user.id); // No token
    expect(response.status()).toBe(200); // Petstore API doesn't enforce auth for DELETE
  });

  test("POST /user - Create duplicate user", async () => {
    await apiHelper.createUser(user); // Create first user
    const response = await apiHelper.createUser(user); // Attempt duplicate
    expect(response.status()).toBe(200); // Petstore allows duplicates
    // Note: If API rejects duplicates, expect 400/409 and validate error message
  });
});
