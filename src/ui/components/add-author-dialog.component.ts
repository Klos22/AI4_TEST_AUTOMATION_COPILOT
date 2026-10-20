import { Page, Locator } from '@playwright/test';

export class AddAuthorDialogComponent {
  readonly root: Locator;
  readonly heading: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly cancelButton: Locator;
  readonly closeButton: Locator;
  readonly submitButton: Locator;

  constructor(private readonly page: Page) {
    this.root = page.locator('.modal.active');
    this.heading = this.root.getByRole('heading', { name: 'Add New Author' });
    this.firstNameInput = this.root.getByRole('textbox', { name: 'First Name' });
    this.lastNameInput = this.root.getByRole('textbox', { name: 'Last Name' });
    this.cancelButton = this.root.getByRole('button', { name: 'Cancel' });
    this.closeButton = this.root.getByRole('button', { name: '×' });
    this.submitButton = this.root.getByRole('button', { name: 'Add Author' });
  }

  async fillFirstName(firstName: string): Promise<void> {
    await this.firstNameInput.fill(firstName);
  }

  async fillLastName(lastName: string): Promise<void> {
    await this.lastNameInput.fill(lastName);
  }

  async fill(firstName: string, lastName: string): Promise<void> {
    await this.fillFirstName(firstName);
    await this.fillLastName(lastName);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async close(): Promise<void> {
    await this.closeButton.click();
  }
}
