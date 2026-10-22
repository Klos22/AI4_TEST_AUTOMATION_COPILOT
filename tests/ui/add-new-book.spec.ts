import { test, expect } from '@fixtures/test.fixture';
import { AuthorFormData } from '@ui/models/author.model';
import { BookFormData } from '@ui/models/book.model';
import { createAuthorFormData } from '@ui/factories/author.factory';
import { createBookFormData } from '@ui/factories/book.factory';

test.describe('Manage Books — add a new book', { tag: ['@ui', '@books'] }, () => {
  let author: AuthorFormData;
  let book: BookFormData;

  test.beforeEach(() => {
    author = createAuthorFormData();
    book = createBookFormData();
  });

  test('should add a new book with a newly created author', async ({
    bookstorePage,
    navbar,
    authorsPage,
    addAuthorDialog,
    manageBooksPage,
    addBookDialog,
  }) => {
    // Arrange — create a new author
    await bookstorePage.goto();
    await navbar.openAuthors();
    await authorsPage.openAddAuthorDialog();
    await addAuthorDialog.fill(author.firstName, author.lastName);
    await addAuthorDialog.submit();
    await expect(authorsPage.successMessage).toBeVisible();

    // Act — add a book assigned to the new author
    await navbar.openManageBooks();
    await manageBooksPage.openAddBookDialog();
    await addBookDialog.fill(book);
    await addBookDialog.selectAuthor(author.fullName);
    await addBookDialog.submit();

    // Assert — the book is listed with the expected data
    await manageBooksPage.search(book.title);
    const row = manageBooksPage.bookRow(book.title);
    await expect(row).toHaveCount(1);
    await expect.soft(row.getByRole('cell', { name: author.fullName })).toBeVisible();
    await expect.soft(row.getByRole('cell', { name: String(book.year) })).toBeVisible();
    await expect.soft(row.getByRole('cell', { name: String(book.quantity), exact: true })).toBeVisible();
  });
});
