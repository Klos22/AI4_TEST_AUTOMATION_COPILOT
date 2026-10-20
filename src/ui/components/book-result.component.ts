import { Page, Locator } from '@playwright/test';

export class BookResultComponent {
  readonly title: Locator;
  readonly info: Locator;

  constructor(page: Page) {
    this.title = page.getByRole('main').getByRole('heading', { level: 3 });
    this.info = this.title.locator('..');
  }

  async open(): Promise<void> {
    await this.title.click();
  }
}
