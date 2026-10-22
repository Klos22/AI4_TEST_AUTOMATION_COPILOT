import { Page, Locator } from '@playwright/test';
import { BookFormData } from '@ui/models/book.model';

export class AddBookDialogComponent {
  readonly titleInput: Locator;
  readonly yearInput: Locator;
  readonly priceInput: Locator;
  readonly quantityInput: Locator;
  readonly submitButton: Locator;

  constructor(private readonly page: Page) {
    this.titleInput = page.getByRole('textbox', { name: 'Title *' });
    this.yearInput = page.getByRole('spinbutton', { name: 'Year *' });
    this.priceInput = page.getByRole('spinbutton', { name: 'Price ($) *' });
    this.quantityInput = page.getByRole('spinbutton', { name: 'Available Quantity *' });
    this.submitButton = page.getByRole('button', { name: 'Add Book' });
  }

  async fill(book: BookFormData): Promise<void> {
    await this.titleInput.fill(book.title);
    await this.yearInput.fill(String(book.year));
    await this.priceInput.fill(String(book.price));
    await this.quantityInput.fill(String(book.quantity));
  }

  // Click the author row (not the checkbox input) so the app registers the selection
  async selectAuthor(fullName: string): Promise<void> {
    await this.page.getByText(fullName, { exact: true }).filter({ visible: true }).click();
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}
