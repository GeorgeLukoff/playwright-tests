import { test as base, expect } from "@playwright/test";
import { TodoMvcPage } from "../pages/todos-page";
import { defaultTodo as defaultText } from "../data/todos";

type Fixtures = {
  todoPage: TodoMvcPage;
  todoText: string;
};

export const test = base.extend<Fixtures>({
  todoPage: async ({ page, baseURL }, use) => {
    if (!baseURL)
      throw new Error("baseURL is not defined in Playwright config");
    await page.goto(baseURL);
    await use(new TodoMvcPage(page));
  },

  todoText: async ({}, use, info) => {
    // default text + project + retry + repeat index
    await use(
      `${defaultText}-${info.project.name}-${info.retry}-${info.repeatEachIndex}`
    );
  },
});

export { expect };