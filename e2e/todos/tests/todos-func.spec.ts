import { test, expect } from "@playwright/test";
import {
  navigate,
  addTodo,
  getTodoItem,
  markTodoAsComplete,
  deleteTodo,
  removeFuncIfExists,
} from "../helpers/todos-helper";
import { defaultTodo as todoText } from "../data/todos";

test.describe("New Todo (function style)", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await navigate(page, baseURL!);
    await removeFuncIfExists(page, todoText);
  });

  test.afterEach(async ({ page }) => {
    // ✅ post-test cleanup; don't fail the suite if it flakes
    try {
      await removeFuncIfExists(page, todoText);
    } catch (err) {
      console.warn(`Cleanup failed for "${todoText}":`, err);
    }
  });

  test("add a todo  @smoke", async ({ page }) => {
    await addTodo(page, todoText);
    await expect(getTodoItem(page, todoText)).toBeVisible();
  });

  test("complete a todo @regression", async ({ page }) => {
    await addTodo(page, todoText);
    await markTodoAsComplete(page, todoText);
    await expect(getTodoItem(page, todoText)).toHaveClass(/completed/);
  });

  test("delete a todo @regression", async ({ page }) => {
    await addTodo(page, todoText);
    await deleteTodo(page, todoText);
    await expect(getTodoItem(page, todoText)).toHaveCount(0);
  });
});
