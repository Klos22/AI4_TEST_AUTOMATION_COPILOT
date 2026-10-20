import { test as base } from '@playwright/test';
import { BookstorePage } from '@ui/pages/bookstore.page';
import { BookResultComponent } from '@ui/components/book-result.component';
import { BookDetailsComponent } from '@ui/components/book-details.component';
import { AuthorsPage } from '@ui/pages/authors.page';
import { NavbarComponent } from '@ui/components/navbar.component';
import { AddAuthorDialogComponent } from '@ui/components/add-author-dialog.component';
import { AuthorCardComponent } from '@ui/components/author-card.component';

type Pages = {
  bookstorePage: BookstorePage;
  bookResult: BookResultComponent;
  bookDetails: BookDetailsComponent;
  authorsPage: AuthorsPage;
  navbar: NavbarComponent;
  addAuthorDialog: AddAuthorDialogComponent;
  authorCard: AuthorCardComponent;
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
  authorsPage: async ({ page }, use) => {
    await use(new AuthorsPage(page));
  },
  navbar: async ({ page }, use) => {
    await use(new NavbarComponent(page));
  },
  addAuthorDialog: async ({ page }, use) => {
    await use(new AddAuthorDialogComponent(page));
  },
  authorCard: async ({ page }, use) => {
    await use(new AuthorCardComponent(page));
  },
});

export { expect } from '@playwright/test';