import { test, expect } from '@fixtures/test.fixture';
import { EFFECTIVE_JAVA as book } from '@data/books.data';

test.describe('Bookstore — search for a book', { tag: ['@ui', '@search'] }, () => {
  test('should display Effective Java details after searching', async ({
    bookstorePage,
    bookResult,
    bookDetails,
  }) => {
    await bookstorePage.goto();
    await expect(bookstorePage.heading).toBeVisible();
    await expect(bookstorePage.searchBox).toBeVisible();

    await bookstorePage.search(book.searchTerm);
    await expect(bookstorePage.searchBox).toHaveValue(book.searchTerm);

    await expect(bookResult.title).toHaveCount(1);
    await expect(bookResult.title).toHaveText(book.title);
    await expect.soft(bookResult.info).toContainText(book.author);
    await expect.soft(bookResult.info).toContainText(book.year);
    await expect.soft(bookResult.info).toContainText(book.price);
    await expect.soft(bookResult.info).toContainText(`In stock: ${book.stock}`);

    await bookResult.open();

    await expect(bookDetails.title(book.title)).toBeVisible();
    const details = bookDetails.container(book.title);
    await expect.soft(details).toContainText(`by ${book.author}`);
    await expect.soft(details).toContainText(new RegExp(`Year:\\s*${book.year}`));
    await expect.soft(details).toContainText(`${book.stock} copies available`);
    await expect.soft(details).toContainText(book.price);
  });
});
