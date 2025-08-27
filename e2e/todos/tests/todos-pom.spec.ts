import { test, expect } from "../fixtures/todos-fixture";
import { removePomIfExists } from "../helpers/todos-helper";

test.describe("New Todo (Page Object Model style)", () => {
  test.beforeEach(async ({ todoPage, todoText }) => {
    await removePomIfExists(todoPage, todoText);
  });

  test.afterEach(async ({ todoPage, todoText }) => {
    try {
      await removePomIfExists(todoPage, todoText);
    } catch (err) {
      console.warn(`Cleanup failed for todo "${todoText}":`, err);
    }
  });

  test("add a todo @regression", async ({ todoPage, todoText }) => {
    await todoPage.addTodo(todoText);
    await expect(todoPage.getTodoItem(todoText)).toBeVisible();
  });

  test("complete a todo @smoke", async ({ todoPage, todoText }) => {
    await todoPage.addTodo(todoText);
    await todoPage.markTodoAsComplete(todoText);
    await expect(todoPage.getTodoItem(todoText)).toHaveClass(/completed/);
  });

  test("delete a todo @smoke", async ({ todoPage, todoText }) => {
    await todoPage.addTodo(todoText);
    await todoPage.deleteTodo(todoText);
    await expect(todoPage.getTodoItem(todoText)).toHaveCount(0);
  });
});
