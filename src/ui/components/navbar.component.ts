import { Page, Locator } from '@playwright/test';

export class NavbarComponent {
  readonly booksLink: Locator;
  readonly manageBooksLink: Locator;
  readonly authorsLink: Locator;
  readonly ordersLink: Locator;

  constructor(page: Page) {
    this.booksLink = page.getByRole('link', { name: /^Books/ });
    this.manageBooksLink = page.getByRole('link', { name: /^Manage Books/ });
    this.authorsLink = page.getByRole('link', { name: /^Authors/ });
    this.ordersLink = page.getByRole('link', { name: /^Orders/ });
  }

  async openBooks(): Promise<void> {
    await this.booksLink.click();
  }

  async openManageBooks(): Promise<void> {
    await this.manageBooksLink.click();
  }

  async openAuthors(): Promise<void> {
    await this.authorsLink.click();
  }

  async openOrders(): Promise<void> {
    await this.ordersLink.click();
  }
}
