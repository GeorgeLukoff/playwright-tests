import { Page, Locator } from "@playwright/test";

export class TodoMvcPage {
  readonly page: Page;
  readonly newTodoInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newTodoInput = page.getByPlaceholder("What needs to be done?");
  }

  async navigate() {
    await this.page.goto("/todomvc/");
  }

  async addTodo(text: string) {
    await this.newTodoInput.fill(text);
    await this.newTodoInput.press("Enter");
  }

  getTodoItem(text: string): Locator {
    return this.page.locator("li", { hasText: text });
  }

  async markTodoAsComplete(text: string) {
    const item = this.getTodoItem(text);
    await item.getByRole("checkbox").check();
  }

  async deleteTodo(text: string) {
    const item = this.getTodoItem(text);
    await item.hover();
    await item.getByRole("button").click();
  }
}