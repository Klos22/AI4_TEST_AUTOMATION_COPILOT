import { Page, Locator } from '@playwright/test';

export class AuthorsPage {
  readonly heading: Locator;
  readonly searchBox: Locator;
  readonly addAuthorButton: Locator;
  readonly successMessage: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Authors Management' });
    this.searchBox = page.getByRole('textbox', { name: 'Search by first name or last name...' });
    this.addAuthorButton = page.getByRole('button', { name: 'Add New Author' });
    this.successMessage = page.getByText('Author added successfully!');
  }

  authorHeading(fullName: string): Locator {
    return this.page.getByRole('heading', { name: fullName });
  }

  async openAddAuthorDialog(): Promise<void> {
    await this.addAuthorButton.click();
  }

  async search(query: string): Promise<void> {
    await this.searchBox.fill(query);
    await this.searchBox.press('Enter');
  }
}
