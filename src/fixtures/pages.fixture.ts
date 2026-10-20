import { test as base } from '@playwright/test';
import { BookstorePage } from '@ui/pages/bookstore.page';
import { BookResultComponent } from '@ui/components/book-result.component';
import { BookDetailsComponent } from '@ui/components/book-details.component';

type Pages = {
  bookstorePage: BookstorePage;
  bookResult: BookResultComponent;
  bookDetails: BookDetailsComponent;
};

export const test = base.extend<Pages>({
  bookstorePage: async ({ page }, use) => {
    await use(new BookstorePage(page));
  },
  bookResult: async ({ page }, use) => {
    await use(new BookResultComponent(page));
  },
  bookDetails: async ({ page }, use) => {
    await use(new BookDetailsComponent(page));
  },
});

export { expect } from '@playwright/test';