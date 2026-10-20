import { Page, Locator } from '@playwright/test';

export class AddAuthorDialogComponent {
  readonly root: Locator;
  readonly heading: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.root = page.locator('.modal.active');
    this.heading = this.root.getByRole('heading', { name: 'Add New Author' });
    this.firstNameInput = this.root.getByRole('textbox', { name: 'First Name' });
    this.lastNameInput = this.root.getByRole('textbox', { name: 'Last Name' });
    this.submitButton = this.root.getByRole('button', { name: 'Add Author' });
  }

  async fillFirstName(firstName: string): Promise<void> {
    await this.firstNameInput.fill(firstName);
  }

  async fillLastName(lastName: string): Promise<void> {
    await this.lastNameInput.fill(lastName);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}
