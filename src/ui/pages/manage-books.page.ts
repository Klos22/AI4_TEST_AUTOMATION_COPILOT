import { Page, Locator } from '@playwright/test';

export class ManageBooksPage {
  readonly addBookButton: Locator;
  readonly searchBox: Locator;
  readonly searchButton: Locator;

  constructor(private readonly page: Page) {
    this.addBookButton = page.getByRole('button', { name: /Add New Book/ });
    this.searchBox = page.getByRole('textbox', { name: 'Search by title or author...' });
    this.searchButton = page.getByRole('button', { name: '🔍' });
  }

  bookRow(title: string): Locator {
    return this.page.getByRole('row').filter({ hasText: title });
  }

  async openAddBookDialog(): Promise<void> {
    await this.addBookButton.click();
  }

  async search(query: string): Promise<void> {
    await this.searchBox.clear();
    await this.searchBox.pressSequentially(query, { delay: 50 });
    await this.searchButton.click();
  }
}
