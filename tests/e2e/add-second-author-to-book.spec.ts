import { test, expect } from '@fixtures/test.fixture';
import { getRandomBookOverridePayload } from '@api/factories/book.factory';
import { AuthorResponse } from '@api/models/author.model';
import { BookResponse } from '@api/models/book.model';

test.describe('Edit book', { tag: ['@e2e', '@regression', '@books'] }, () => {
  let authorA: AuthorResponse | undefined;
  let authorB: AuthorResponse | undefined;
  let book: BookResponse | undefined;

  test.afterEach(async ({ booksApiSteps, authorsApiSteps }) => {
    const cleanupErrors: unknown[] = [];

    if (book) {
      try {
        await booksApiSteps.deleteBook(book.id);
      } catch (error) {
        cleanupErrors.push(error);
      }
    }

    for (const author of [authorA, authorB]) {
      if (!author) continue;

      try {
        await authorsApiSteps.deleteAuthor(author.id);
      } catch (error) {
        cleanupErrors.push(error);
      }
    }

    book = undefined;
    authorA = undefined;
    authorB = undefined;

    expect(cleanupErrors, 'cleanup should delete every created resource').toEqual([]);
  });

  test('should add second author to existing book', async ({
    authorsApiSteps,
    booksApiSteps,
    manageBooksPage,
    editBookDialog,
  }) => {
    // setup api
    authorA = await authorsApiSteps.createAuthor();
    authorB = await authorsApiSteps.createAuthor();
    book = await booksApiSteps.createBook(getRandomBookOverridePayload({ authors: [authorA.id] }));

    const nameA = `${authorA.firstName} ${authorA.lastName}`;
    const nameB = `${authorB.firstName} ${authorB.lastName}`;

    // verify setup api
    const setupBook = await booksApiSteps.getBookById(book.id);
    expect(setupBook.authors.map((a) => a.id)).toEqual([authorA.id]);
    await authorsApiSteps.getAuthorById(authorB.id);

    // ui action
    const row = manageBooksPage.bookRow(book.title);
    await manageBooksPage.open();
    await manageBooksPage.search(book.title);
    await expect(row).toBeVisible();
    await expect(row).toContainText(nameA);
    await expect(row).not.toContainText(nameB);

    await manageBooksPage.openEditBookDialog(book.title);
    await expect(editBookDialog.heading).toBeVisible();
    await expect(editBookDialog.authorCheckbox(nameA)).toBeChecked();
    await expect(editBookDialog.authorCheckbox(nameB)).not.toBeChecked();

    await editBookDialog.selectAuthor(nameB);
    await expect(editBookDialog.authorCheckbox(nameB)).toBeChecked();
    await editBookDialog.submit();

    // ui verification
    await expect(editBookDialog.heading).toBeHidden();
    await expect(row).toBeVisible();
    await expect(row).toContainText(nameA);
    await expect(row).toContainText(nameB);
    await expect(row).toContainText(String(book.year));
    await expect(row).toContainText(String(book.price));
    await expect(row).toContainText(String(book.available));

    await manageBooksPage.openEditBookDialog(book.title);
    await expect(editBookDialog.authorCheckbox(nameA)).toBeChecked();
    await expect(editBookDialog.authorCheckbox(nameB)).toBeChecked();
    await editBookDialog.cancel();

    // api verification
    const finalBook = await booksApiSteps.getBookById(book.id);
    expect(finalBook.authors).toHaveLength(2);
    expect(finalBook.authors.map((a) => a.id).sort()).toEqual([authorA.id, authorB.id].sort());
    expect(finalBook.title).toBe(book.title);
    expect(finalBook.year).toBe(book.year);
    expect(finalBook.price).toBe(book.price);
    expect(finalBook.available).toBe(book.available);
    expect((await authorsApiSteps.getAuthorById(authorA.id)).id).toBe(authorA.id);
    expect((await authorsApiSteps.getAuthorById(authorB.id)).id).toBe(authorB.id);
  });
});
