import { Page, Locator } from '@playwright/test';

export class AuthorCardComponent {
  readonly cards: Locator;

  constructor(page: Page) {
    this.cards = page.locator('.author-card');
  }

  first(): Locator {
    return this.cards.first();
  }

  name(card: Locator, fullName: string): Locator {
    return card.getByRole('heading', { name: fullName });
  }

  id(card: Locator): Locator {
    return card.getByText(/^ID: \d+$/);
  }
}
