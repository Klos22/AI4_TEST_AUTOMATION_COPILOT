import { test, expect } from '@fixtures/test.fixture';
import { createAuthorFormData } from '@ui/factories/author.factory';

test.describe('Authors — add a new author', { tag: ['@ui', '@authors'] }, () => {
  test('should add a new author and find it on the Authors list', async ({
    page,
    bookstorePage,
    navbar,
    authorsPage,
    addAuthorDialog,
    authorCard,
  }) => {
    const author = createAuthorFormData();

    await bookstorePage.goto();
    await expect(navbar.booksLink).toBeVisible();
    await expect(navbar.manageBooksLink).toBeVisible();
    await expect(navbar.authorsLink).toBeVisible();
    await expect(navbar.ordersLink).toBeVisible();

    await navbar.openAuthors();
    await expect(page).toHaveURL(/\/authors$/);
    await expect(authorsPage.heading).toBeVisible();
    await expect(authorsPage.searchBox).toBeVisible();

    await authorsPage.openAddAuthorDialog();
    await expect(addAuthorDialog.heading).toBeVisible();
    await expect(addAuthorDialog.firstNameInput).toBeEmpty();
    await expect(addAuthorDialog.lastNameInput).toBeEmpty();

    await addAuthorDialog.fillFirstName(author.firstName);
    await expect(addAuthorDialog.firstNameInput).toHaveValue(author.firstName);
    await addAuthorDialog.fillLastName(author.lastName);
    await expect(addAuthorDialog.lastNameInput).toHaveValue(author.lastName);

    await addAuthorDialog.submit();
    await expect(authorsPage.successMessage).toBeVisible();
    await expect(addAuthorDialog.root).toBeHidden();
    // The list reloads after adding; searching earlier gets overwritten by the refreshed full list.
    await expect(authorsPage.authorHeading(author.fullName)).toBeAttached();

    await authorsPage.search(author.lastName);
    await expect(authorsPage.searchBox).toHaveValue(author.lastName);

    await expect(authorCard.cards).toHaveCount(1);
    const card = authorCard.first();
    await expect(authorCard.name(card, author.fullName)).toBeVisible();
    await expect.soft(card).toContainText(author.initials);
    await expect.soft(authorCard.id(card)).toBeVisible();
  });
});
