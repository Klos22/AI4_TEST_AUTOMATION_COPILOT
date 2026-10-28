import { test, expect } from '@fixtures/test.fixture';
import { getRandomBookOverridePayload } from '@api/factories/book.factory';
import { AuthorResponse } from '@api/models/author.model';
import { BookPayload, BookResponse } from '@api/models/book.model';
import { BooksAPISteps } from '@api/steps/books/books.api.steps';
import { getRandomAvailable, getRandomBookTitle, getRandomBookYear, getRandomPrice } from '@utils/random.data.utils';
import { z } from 'zod';

const BookResponseSchema = z
  .object({
    id: z.number().int().positive(),
    title: z.string().min(1),
    year: z.number().int().min(1900),
    price: z
      .number()
      .min(1)
      .max(1000)
      .refine((v) => Number.isInteger(Math.round(v * 100 * 1e6) / 1e6), 'price must have at most 2 decimal places'),
    coverId: z.number().int().nullable(),
    available: z.number().int().min(1).max(10000),
    authors: z
      .array(
        z.object({ id: z.number().int().positive(), firstName: z.string().min(1), lastName: z.string().min(1) }).strict(),
      )
      .min(1)
      .refine((list) => new Set(list.map((a) => a.id)).size === list.length, 'author ids must be unique'),
  })
  .strict();

function getDifferent<T>(generate: () => T, original: T): T {
  let value = generate();
  while (value === original) {
    value = generate();
  }
  return value;
}

function toAuthorSummary({ id, firstName, lastName }: AuthorResponse): AuthorResponse {
  return { id, firstName, lastName };
}

function sortById<T extends { id: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.id - b.id);
}

test.describe('PUT /books/{id} 2xx', { tag: ['@api', '@books', '@smoke'] }, () => {
  let author: AuthorResponse;
  let author2: AuthorResponse;
  let author3: AuthorResponse;
  let originalBook: BookResponse;
  let originalPayload: BookPayload;

  test.beforeEach(async ({ authorsApiSteps, booksApiSteps }) => {
    author = await authorsApiSteps.createAuthor();
    author2 = await authorsApiSteps.createAuthor();
    author3 = await authorsApiSteps.createAuthor();
    originalPayload = getRandomBookOverridePayload({ authors: [author.id] });
    originalBook = await booksApiSteps.createBook(originalPayload);
  });

  test.afterEach(async ({ booksApiSteps, authorsApiSteps }) => {
    await booksApiSteps.deleteBook(originalBook.id);
    for (const { id } of [author, author2, author3]) {
      await authorsApiSteps.deleteAuthor(id);
    }
  });

  function getFullUpdatePayload(overrides: Partial<BookPayload> = {}): BookPayload {
    return getRandomBookOverridePayload({
      title: getDifferent(getRandomBookTitle, originalPayload.title),
      authors: [author2.id],
      year: getDifferent(getRandomBookYear, originalPayload.year),
      price: getDifferent(getRandomPrice, originalPayload.price),
      available: getDifferent(getRandomAvailable, originalPayload.available),
      ...overrides,
    });
  }

  function getPartialUpdatePayload(overrides: Partial<BookPayload>): BookPayload {
    return getRandomBookOverridePayload({ ...originalPayload, ...overrides });
  }

  async function putBook(booksApiSteps: BooksAPISteps, payload: BookPayload): Promise<BookResponse> {
    const body = await booksApiSteps.updateBook(originalBook.id, payload);
    const result = BookResponseSchema.safeParse(body);
    expect(result.success, result.success ? '' : result.error.message).toBe(true);
    expect(body.id).toBe(originalBook.id);
    expect(body.coverId).toBeNull();
    return body;
  }

  test(
    'should update all fields of an existing book',
    { annotation: { type: 'scenario', description: 'TC-BOOKS-ID-PUT-POSITIVE-001' } },
    async ({ booksApiSteps }) => {
      const payload = getFullUpdatePayload();

      const body = await putBook(booksApiSteps, payload);

      expect(body.title).toBe(payload.title);
      expect(body.year).toBe(payload.year);
      expect(body.price).toBe(payload.price);
      expect(body.available).toBe(payload.available);
      expect(body.authors).toEqual([toAuthorSummary(author2)]);
    },
  );

  test(
    'should update only title',
    { annotation: { type: 'scenario', description: 'TC-BOOKS-ID-PUT-POSITIVE-002' } },
    async ({ booksApiSteps }) => {
      const payload = getPartialUpdatePayload({ title: getRandomBookTitle() });

      const body = await putBook(booksApiSteps, payload);

      expect(body.title).toBe(payload.title);
      expect(body.title).not.toBe(originalPayload.title);
      expect(body.year).toBe(originalPayload.year);
      expect(body.price).toBe(originalPayload.price);
      expect(body.available).toBe(originalPayload.available);
      expect(body.authors.map((a) => a.id)).toEqual(originalPayload.authors);
    },
  );

  test(
    'should update only year',
    { annotation: { type: 'scenario', description: 'TC-BOOKS-ID-PUT-POSITIVE-003' } },
    async ({ booksApiSteps }) => {
      const payload = getPartialUpdatePayload({ year: getDifferent(getRandomBookYear, originalPayload.year) });

      const body = await putBook(booksApiSteps, payload);

      expect(body.year).toBe(payload.year);
      expect(body.year).not.toBe(originalPayload.year);
      expect(body.title).toBe(originalPayload.title);
      expect(body.price).toBe(originalPayload.price);
      expect(body.available).toBe(originalPayload.available);
      expect(body.authors.map((a) => a.id)).toEqual(originalPayload.authors);
    },
  );

  test(
    'should update only price',
    { annotation: { type: 'scenario', description: 'TC-BOOKS-ID-PUT-POSITIVE-004' } },
    async ({ booksApiSteps }) => {
      const payload = getPartialUpdatePayload({ price: getDifferent(getRandomPrice, originalPayload.price) });

      const body = await putBook(booksApiSteps, payload);

      expect(body.price).toBe(payload.price);
      expect(body.price).not.toBe(originalPayload.price);
      expect(body.title).toBe(originalPayload.title);
      expect(body.year).toBe(originalPayload.year);
      expect(body.available).toBe(originalPayload.available);
      expect(body.authors.map((a) => a.id)).toEqual(originalPayload.authors);
    },
  );

  test(
    'should update only available',
    { annotation: { type: 'scenario', description: 'TC-BOOKS-ID-PUT-POSITIVE-005' } },
    async ({ booksApiSteps }) => {
      const payload = getPartialUpdatePayload({
        available: getDifferent(getRandomAvailable, originalPayload.available),
      });

      const body = await putBook(booksApiSteps, payload);

      expect(body.available).toBe(payload.available);
      expect(body.available).not.toBe(originalPayload.available);
      expect(body.title).toBe(originalPayload.title);
      expect(body.year).toBe(originalPayload.year);
      expect(body.price).toBe(originalPayload.price);
      expect(body.authors.map((a) => a.id)).toEqual(originalPayload.authors);
    },
  );

  test(
    'should replace the author with a different existing author',
    { annotation: { type: 'scenario', description: 'TC-BOOKS-ID-PUT-POSITIVE-006' } },
    async ({ booksApiSteps }) => {
      const payload = getPartialUpdatePayload({ authors: [author2.id] });

      const body = await putBook(booksApiSteps, payload);

      expect(body.authors).toEqual([toAuthorSummary(author2)]);
      expect(body.authors.map((a) => a.id)).not.toContain(author.id);
      expect(body.title).toBe(originalPayload.title);
      expect(body.year).toBe(originalPayload.year);
      expect(body.price).toBe(originalPayload.price);
      expect(body.available).toBe(originalPayload.available);
    },
  );

  test(
    'should update a book to have multiple authors',
    { annotation: { type: 'scenario', description: 'TC-BOOKS-ID-PUT-POSITIVE-007' } },
    async ({ booksApiSteps }) => {
      const payload = getPartialUpdatePayload({ authors: [author.id, author2.id, author3.id] });

      const body = await putBook(booksApiSteps, payload);

      expect(body.authors).toHaveLength(3);
      expect(sortById(body.authors)).toEqual(sortById([author, author2, author3].map(toAuthorSummary)));
    },
  );

  test(
    'should accept the own unchanged title with other fields changed',
    { annotation: { type: 'scenario', description: 'TC-BOOKS-ID-PUT-POSITIVE-008' } },
    async ({ booksApiSteps }) => {
      const payload = getFullUpdatePayload({ title: originalPayload.title });

      const body = await putBook(booksApiSteps, payload);

      expect(body.title).toBe(originalPayload.title);
      expect(body.year).toBe(payload.year);
      expect(body.price).toBe(payload.price);
      expect(body.available).toBe(payload.available);
    },
  );

  const boundaryDatasets: { id: string; description: string; overrides: Partial<BookPayload> }[] = [
    { id: 'TC-BOOKS-ID-PUT-POSITIVE-009', description: 'minimum year (1900)', overrides: { year: 1900 } },
    { id: 'TC-BOOKS-ID-PUT-POSITIVE-010', description: 'minimum price (1)', overrides: { price: 1 } },
    { id: 'TC-BOOKS-ID-PUT-POSITIVE-011', description: 'maximum price (1000)', overrides: { price: 1000 } },
    { id: 'TC-BOOKS-ID-PUT-POSITIVE-012', description: 'decimal price (149.99)', overrides: { price: 149.99 } },
    { id: 'TC-BOOKS-ID-PUT-POSITIVE-013', description: 'minimum available (1)', overrides: { available: 1 } },
    { id: 'TC-BOOKS-ID-PUT-POSITIVE-014', description: 'maximum available (10000)', overrides: { available: 10000 } },
  ];

  boundaryDatasets.forEach(({ id, description, overrides }) => {
    test(
      `should accept ${description}`,
      { annotation: { type: 'scenario', description: id } },
      async ({ booksApiSteps }) => {
        const payload = getFullUpdatePayload(overrides);

        const body = await putBook(booksApiSteps, payload);

        expect(body.title).toBe(payload.title);
        expect(body.year).toBe(payload.year);
        expect(body.price).toBe(payload.price);
        expect(body.available).toBe(payload.available);
        expect(body.authors.map((a) => a.id)).toEqual(payload.authors);
      },
    );
  });

  test(
    'should persist the update and return it from GET /books/{id}',
    { annotation: { type: 'scenario', description: 'TC-BOOKS-ID-PUT-POSITIVE-015' } },
    async ({ booksApiSteps }) => {
      const payload = getFullUpdatePayload();

      const putBody = await putBook(booksApiSteps, payload);
      const fetched = await booksApiSteps.getBookById(originalBook.id);

      expect(fetched.id).toBe(originalBook.id);
      expect(fetched.title).toBe(payload.title);
      expect(fetched.year).toBe(payload.year);
      expect(fetched.price).toBe(payload.price);
      expect(fetched.available).toBe(payload.available);
      expect(fetched.coverId).toBeNull();
      expect(sortById(fetched.authors)).toEqual(sortById(putBody.authors));
      expect(fetched.title).not.toBe(originalPayload.title);
      expect(fetched.authors.map((a) => a.id)).not.toContain(author.id);
    },
  );

  test(
    'should return the same result when the same PUT is repeated',
    { annotation: { type: 'scenario', description: 'TC-BOOKS-ID-PUT-POSITIVE-016' } },
    async ({ booksApiSteps }) => {
      const payload = getFullUpdatePayload();

      const first = await putBook(booksApiSteps, payload);
      const second = await putBook(booksApiSteps, payload);

      expect(second).toEqual(first);
      expect(await booksApiSteps.getBookById(originalBook.id)).toEqual(first);
    },
  );
});
