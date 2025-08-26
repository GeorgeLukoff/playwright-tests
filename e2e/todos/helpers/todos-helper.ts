import { Page, Locator, expect } from "@playwright/test";
import { TodoMvcPage } from "../../../e2e/todos/pages/todos-page";

/**
 * Returns the locator for the "new todo" input field.
 *
 * @param page - The Playwright Page object.
 * @returns A Locator targeting the "What needs to be done?" input.
 */
export const newTodoInput = (page: Page): Locator =>
  page.getByPlaceholder("What needs to be done?");

/**
 * Returns a locator for a specific todo item based on its text.
 *
 * @param page - The Playwright Page object.
 * @param text - The exact text of the todo item.
 * @returns A Locator targeting the <li> containing the todo text.
 */
export const getTodoItem = (page: Page, text: string): Locator =>
  page.locator("li", { hasText: text });

/**
 * Navigates to the TodoMVC app using the configured baseURL.
 *
 * @param page - The Playwright Page object.
 * @param baseURL - The base URL from Playwright config (must be defined).
 * @throws Will throw if baseURL is not provided.
 */
export async function navigate(page: Page, baseURL: string) {
  if (!baseURL) throw new Error("baseURL is not defined in Playwright config");
  await page.goto(baseURL);
}

// /**
//  * Navigates to the TodoMVC app using the configured baseURL.
//  *
//  * @param page - The Playwright Page object.
//  * @param path - Relative path to navigate to (defaults to root).
//  */
// export async function navigate(page: Page, path: string = "/") {
//   await page.goto(path); // ✅ resolved against use.baseURL in playwright.config.ts
// }

/**
 * Adds a new todo item.
 *
 * @param page - The Playwright Page object.
 * @param text - The text to enter as a new todo.
 */
export async function addTodo(page: Page, text: string) {
  await newTodoInput(page).fill(text);
  await newTodoInput(page).press("Enter");
}

/**
 * Marks an existing todo as complete by checking its checkbox.
 *
 * @param page - The Playwright Page object.
 * @param text - The text of the todo item to mark complete.
 */
export async function markTodoAsComplete(page: Page, text: string) {
  const item = getTodoItem(page, text);
  await item.getByRole("checkbox").check();
}

/**
 * Deletes a todo item by hovering and clicking its delete button.
 *
 * @param page - The Playwright Page object.
 * @param text - The text of the todo item to delete.
 */
export async function deleteTodo(page: Page, text: string) {
  const item = getTodoItem(page, text);
  await item.hover();
  await item.getByRole("button").click();
}

/**
 * Removes *every* todo that exactly matches `text`.
 * Re-queries each loop (DOM shrinks) and asserts progress to avoid flakes.
 */
export const removePomIfExists = async (
  todoPage: TodoMvcPage,
  text: string
): Promise<void> => {
  let prevCount = await todoPage.getTodoItem(text).count();
  // keep swinging until none left
  while (prevCount > 0) {
    await todoPage.deleteTodo(text); // deletes one matching item
    await expect
      .poll(async () => await todoPage.getTodoItem(text).count())
      .toBeLessThan(prevCount);
    prevCount = await todoPage.getTodoItem(text).count();
  }

  // final sanity
  await expect(todoPage.getTodoItem(text)).toHaveCount(0);
};

/**
 * Removes *all* todo items that exactly match the given `text`.
 * Safe to call in beforeEach/afterEach: if no matching todo exists,
 * it does nothing. If there are duplicates, it deletes them all.
 *
 * @param page - Playwright Page instance
 * @param text - The todo text to remove if present
 */
export async function removeFuncIfExists(page: Page, text: string) {
  let prev = await getTodoItem(page, text).count();

  while (prev > 0) {
    await deleteTodo(page, text);

    await expect
      .poll(async () => await getTodoItem(page, text).count())
      .toBeLessThan(prev);

    prev = await getTodoItem(page, text).count();
  }
}
