import { Page, Locator } from '@playwright/test';

export class BookDetailsComponent {
  constructor(private readonly page: Page) {}

  title(bookTitle: string): Locator {
    return this.page.getByRole('heading', { name: bookTitle, level: 2 });
  }

  container(bookTitle: string): Locator {
    return this.title(bookTitle).locator('..');
  }
}
