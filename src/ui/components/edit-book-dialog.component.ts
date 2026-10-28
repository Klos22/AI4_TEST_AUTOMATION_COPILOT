import { Page, Locator } from '@playwright/test';

export class EditBookDialogComponent {
  readonly heading: Locator;
  readonly updateButton: Locator;
  readonly cancelButton: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByText('✏️ Edit Book');
    this.updateButton = page.getByRole('button', { name: 'Update Book' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
  }

  authorCheckbox(fullName: string): Locator {
    return this.page.getByText(fullName, { exact: true }).locator('..').getByRole('checkbox');
  }

  // Click the label text (not the input) so the app registers the selection
  async selectAuthor(fullName: string): Promise<void> {
    await this.page.getByText(fullName, { exact: true }).filter({ visible: true }).click();
  }

  async submit(): Promise<void> {
    await this.updateButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }
}
