import { test, expect } from '@fixtures/test.fixture';
import { AuthorFormData } from '@ui/models/author.model';
import { createAuthorFormData } from '@ui/factories/author.factory';

test.describe('Authors — add a new author', { tag: ['@ui', '@authors'] }, () => {
  let author: AuthorFormData;

  test.beforeEach(() => {
    author = createAuthorFormData();
  });

  test('should add a new author and find it on the Authors list', async ({
    page,
    bookstorePage,
    navbar,
    authorsPage,
    addAuthorDialog,
    authorCard,
  }) => {
    // Arrange
    await bookstorePage.goto();
    await expect(navbar.booksLink).toBeVisible();
    await expect(navbar.manageBooksLink).toBeVisible();
    await expect(navbar.authorsLink).toBeVisible();
    await expect(navbar.ordersLink).toBeVisible();

    // Act & Assert — Navigate to Authors
    await navbar.openAuthors();
    await expect(page).toHaveURL(/\/authors$/);
    await expect(authorsPage.heading).toBeVisible();
    await expect(authorsPage.searchBox).toBeVisible();

    // Act & Assert — Open Add Author modal
    await authorsPage.openAddAuthorDialog();
    await expect(addAuthorDialog.heading).toBeVisible();
    await expect(addAuthorDialog.firstNameInput).toBeEmpty();
    await expect(addAuthorDialog.lastNameInput).toBeEmpty();

    // Act & Assert — Fill author details
    await addAuthorDialog.fillFirstName(author.firstName);
    await expect(addAuthorDialog.firstNameInput).toHaveValue(author.firstName);
    await addAuthorDialog.fillLastName(author.lastName);
    await expect(addAuthorDialog.lastNameInput).toHaveValue(author.lastName);

    // Act & Assert — Submit author form
    await addAuthorDialog.submit();
    await expect(authorsPage.successMessage).toBeVisible();
    await expect(addAuthorDialog.root).toBeHidden();

    // Act & Assert — Search and verify created author card
    await authorsPage.search(author.lastName);
    await expect(authorsPage.searchBox).toHaveValue(author.lastName);

    const card = authorCard.withName(author.fullName);
    await expect(card).toHaveCount(1);
    await expect(authorCard.name(card, author.fullName)).toBeVisible();
    await expect.soft(authorCard.avatar(card)).toContainText(author.initials);
    await expect.soft(authorCard.id(card)).toBeVisible();
  });
});
