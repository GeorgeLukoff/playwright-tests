import { test, expect } from "@playwright/test";
import { TodoMvcPage } from "../../../e2e/todos/pages/todos-page";
import { defaultTodo as todoText } from "../../../e2e/todos/data/todos";
import { removePomIfExists } from "../../../e2e/todos/helpers/todos-helper";

test.describe("New Todo (Page Object Model style)", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    if (!baseURL)
      throw new Error("baseURL is not defined in Playwright config");
    await page.goto(baseURL);

    const todoPage = new TodoMvcPage(page);
    await removePomIfExists(todoPage, todoText); // pre-test cleanup
  });

  test.afterEach(async ({ page }) => {
    try {
      const todoPage = new TodoMvcPage(page);
      await removePomIfExists(todoPage, todoText);
    } catch (err) {
      console.warn(`Cleanup failed for todo "${todoText}":`, err);
    }
  });

  test("add a todo @regression", async ({ page }) => {
    const todoPage = new TodoMvcPage(page);
    await todoPage.addTodo(todoText);
    await expect(todoPage.getTodoItem(todoText)).toBeVisible();
  });

  test("complete a todo @smoke", async ({ page }) => {
    const todoPage = new TodoMvcPage(page);
    await todoPage.addTodo(todoText);
    await todoPage.markTodoAsComplete(todoText);
    await expect(todoPage.getTodoItem(todoText)).toHaveClass(/completed/);
  });

  test("delete a todo @smoke", async ({ page }) => {
    const todoPage = new TodoMvcPage(page);
    await todoPage.addTodo(todoText);
    await todoPage.deleteTodo(todoText);
    await expect(todoPage.getTodoItem(todoText)).toHaveCount(0);
  });
});
