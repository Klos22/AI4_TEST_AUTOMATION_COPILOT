import { Page, Locator } from '@playwright/test';

export class BookstorePage {
  readonly heading: Locator;
  readonly searchBox: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Available Books' });
    this.searchBox = page.getByRole('textbox', { name: 'Search books by title or author...' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async search(query: string): Promise<void> {
    await this.searchBox.fill(query);
  }
}
