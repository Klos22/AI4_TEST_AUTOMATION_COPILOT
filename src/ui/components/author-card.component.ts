import { Page, Locator } from '@playwright/test';

export class AuthorCardComponent {
  readonly cards: Locator;

  constructor(private readonly page: Page) {
    this.cards = page.locator('.author-card');
  }

  withId(id: number): Locator {
    return this.cards.filter({
      has: this.page.getByText(`ID: ${id}`, { exact: true }),
    });
  }

  withName(fullName: string): Locator {
    return this.cards.filter({
      has: this.page.getByRole('heading', { name: fullName }),
    });
  }

  first(): Locator {
    return this.cards.first();
  }

  name(card: Locator, fullName: string): Locator {
    return card.getByRole('heading', { name: fullName });
  }

  avatar(card: Locator): Locator {
    return card.locator('.author-avatar');
  }

  id(card: Locator): Locator {
    return card.getByText(/^ID: \d+$/);
  }
}
