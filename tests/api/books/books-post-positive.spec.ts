import { test, expect } from '@fixtures/test.fixture';
import { APIResponse } from '@playwright/test';
import { HTTP_201_CREATED } from '@api/consts/http.status.codes.const';
import { getRandomBookOverridePayload } from '@api/factories/book.factory';
import { AuthorResponse } from '@api/models/author.model';
import { BookPayload, BookResponse } from '@api/models/book.model';
import { parseResponse } from '@utils/parse.response.utils';
import { z } from 'zod';

type NumericBookField = 'year' | 'price' | 'available';

const MIN_YEAR = 1900;
const MIN_PRICE = 0.01;
const MAX_PRICE = 1000;
const MIN_AVAILABLE = 1;
const MAX_AVAILABLE = 10000;
const DECIMAL_PRICE = 49.99;
const CONTENT_TYPE_JSON = 'application/json';
const ALLOWED_BOOK_PROPERTIES = ['id', 'title', 'year', 'price', 'coverId', 'available', 'authors'];

const BookResponseSchema = z
  .object({
    id: z.number().int(),
    title: z.string(),
    year: z.number().int(),
    price: z.number(),
    coverId: z.number().int().nullable(),
    available: z.number().int(),
    authors: z.array(
      z
        .object({
          id: z.number().int(),
          firstName: z.string(),
          lastName: z.string(),
        })
        .strict(),
    ),
  })
  .strict();

function assertBookSchema(body: BookResponse): void {
  const result = BookResponseSchema.safeParse(body);
  expect(result.success, result.success ? '' : result.error.message).toBe(true);
}

function assertNoUnexpectedBookProperties(body: BookResponse): void {
  const keys = Object.keys(body);
  expect(ALLOWED_BOOK_PROPERTIES, `book ${JSON.stringify(body)}`).toEqual(expect.arrayContaining(keys));
  expect(keys, `book ${JSON.stringify(body)}`).toEqual(expect.arrayContaining(ALLOWED_BOOK_PROPERTIES));
}

function assertCreatedResponseHeaders(response: APIResponse, bookId: number): void {
  expect(response.headers()['content-type']).toContain(CONTENT_TYPE_JSON);
  expect(response.headers()['location'], '201 Created should return location header').toMatch(new RegExp(`/books/${bookId}$`));
}

const boundaryDatasets: { id: string; description: string; field: NumericBookField; value: number }[] = [
  { id: 'TC-BOOKS-POST-POSITIVE-004', description: `minimum year (${MIN_YEAR})`, field: 'year', value: MIN_YEAR },
  { id: 'TC-BOOKS-POST-POSITIVE-005', description: `minimum price (${MIN_PRICE})`, field: 'price', value: MIN_PRICE },
  { id: 'TC-BOOKS-POST-POSITIVE-006', description: `maximum price (${MAX_PRICE})`, field: 'price', value: MAX_PRICE },
  {
    id: 'TC-BOOKS-POST-POSITIVE-008',
    description: `minimum available (${MIN_AVAILABLE})`,
    field: 'available',
    value: MIN_AVAILABLE,
  },
  {
    id: 'TC-BOOKS-POST-POSITIVE-009',
    description: `maximum available (${MAX_AVAILABLE})`,
    field: 'available',
    value: MAX_AVAILABLE,
  },
];

test.describe('POST /books 2xx', { tag: ['@api', '@books', '@smoke'] }, () => {
  let author: AuthorResponse;
  let author2: AuthorResponse;
  const createdBookIds: number[] = [];

  test.beforeEach(async ({ authorsApiSteps }) => {
    author = await authorsApiSteps.createAuthor();
    author2 = await authorsApiSteps.createAuthor();
  });

  test.afterEach(async ({ booksApiSteps, authorsApiSteps }) => {
    for (const id of createdBookIds.splice(0)) {
      await booksApiSteps.deleteBook(id);
    }
    for (const { id } of [author, author2]) {
      await authorsApiSteps.deleteAuthor(id);
    }
  });

  test(
    'should create a book with all required fields and one author',
    { annotation: { type: 'scenario', description: 'TC-BOOKS-POST-POSITIVE-001' } },
    async ({ booksApiRequest }) => {
      const payload = getRandomBookOverridePayload({ authors: [author.id] });

      const response = await booksApiRequest.createBook(payload);

      expect(response.status()).toBe(HTTP_201_CREATED);
      const body = await parseResponse<BookResponse>(response);
      assertCreatedResponseHeaders(response, body.id);
      assertBookSchema(body);
      assertNoUnexpectedBookProperties(body);
      createdBookIds.push(body.id);

      expect(Number.isInteger(body.id), 'body.id should be an integer').toBe(true);
      expect(body.title).toBe(payload.title);
      expect(body.year).toBe(payload.year);
      expect(body.price).toBe(payload.price);
      expect(body.available).toBe(payload.available);
      expect(body.coverId).toBeNull();
      expect(body.authors).toHaveLength(1);
      expect(body.authors[0]).toEqual({ id: author.id, firstName: author.firstName, lastName: author.lastName });
    },
  );

  test(
    'should persist the created book and make it retrievable',
    { annotation: { type: 'scenario', description: 'TC-BOOKS-POST-POSITIVE-002' } },
    async ({ booksApiRequest, booksApiSteps }) => {
      const payload = getRandomBookOverridePayload({ authors: [author.id] });

      const response = await booksApiRequest.createBook(payload);

      expect(response.status()).toBe(HTTP_201_CREATED);
      const body = await parseResponse<BookResponse>(response);
      assertCreatedResponseHeaders(response, body.id);
      assertBookSchema(body);
      assertNoUnexpectedBookProperties(body);
      createdBookIds.push(body.id);

      const fetched = await booksApiSteps.getBookById(body.id);
      expect(fetched.title).toBe(payload.title);
      expect(fetched.year).toBe(payload.year);
      expect(fetched.price).toBe(payload.price);
      expect(fetched.available).toBe(payload.available);
      expect(fetched.authors.map((a) => a.id)).toContain(author.id);

      const found = await booksApiSteps.getBooks({ title: payload.title });
      expect(found.some((b) => b.id === body.id)).toBe(true);
    },
  );

  test(
    'should create a book with multiple authors',
    { annotation: { type: 'scenario', description: 'TC-BOOKS-POST-POSITIVE-003' } },
    async ({ booksApiRequest, booksApiSteps }) => {
      const payload = getRandomBookOverridePayload({ authors: [author.id, author2.id] });
      const expectedAuthorIds = [author.id, author2.id].sort((a, b) => a - b);

      const response = await booksApiRequest.createBook(payload);

      expect(response.status()).toBe(HTTP_201_CREATED);
      const body = await parseResponse<BookResponse>(response);
      assertCreatedResponseHeaders(response, body.id);
      assertBookSchema(body);
      assertNoUnexpectedBookProperties(body);
      createdBookIds.push(body.id);

      expect(body.authors).toHaveLength(2);
      expect(body.authors.map((a) => a.id).sort((a, b) => a - b)).toEqual(expectedAuthorIds);

      const fetched = await booksApiSteps.getBookById(body.id);
      expect(fetched.authors).toHaveLength(2);
      expect(fetched.authors.map((a) => a.id).sort((a, b) => a - b)).toEqual(expectedAuthorIds);
    },
  );

  boundaryDatasets.forEach(({ id, description, field, value }) => {
    test(
      `should accept ${description}`,
      { annotation: { type: 'scenario', description: id } },
      async ({ booksApiRequest }) => {
        const overrides: Partial<BookPayload> = { authors: [author.id], [field]: value };
        const payload = getRandomBookOverridePayload(overrides);

        const response = await booksApiRequest.createBook(payload);

        expect(response.status()).toBe(HTTP_201_CREATED);
        const body = await parseResponse<BookResponse>(response);
        assertCreatedResponseHeaders(response, body.id);
        assertBookSchema(body);
        assertNoUnexpectedBookProperties(body);
        createdBookIds.push(body.id);

        expect(body[field]).toBe(value);
        expect(body.title).toBe(payload.title);
        expect(body.authors.map((a) => a.id)).toContain(author.id);
      },
    );
  });

  test(
    `should accept decimal price (${DECIMAL_PRICE})`,
    { annotation: { type: 'scenario', description: 'TC-BOOKS-POST-POSITIVE-007' } },
    async ({ booksApiRequest, booksApiSteps }) => {
      const payload = getRandomBookOverridePayload({ authors: [author.id], price: DECIMAL_PRICE });

      const response = await booksApiRequest.createBook(payload);

      expect(response.status()).toBe(HTTP_201_CREATED);
      const body = await parseResponse<BookResponse>(response);
      assertCreatedResponseHeaders(response, body.id);
      assertBookSchema(body);
      assertNoUnexpectedBookProperties(body);
      createdBookIds.push(body.id);
      expect(body.price).toBe(DECIMAL_PRICE);

      const fetched = await booksApiSteps.getBookById(body.id);
      expect(fetched.price).toBe(DECIMAL_PRICE);
    },
  );

  test(
    'should create two books with different titles sharing the same author',
    { annotation: { type: 'scenario', description: 'TC-BOOKS-POST-POSITIVE-010' } },
    async ({ booksApiRequest, booksApiSteps }) => {
      const payload1 = getRandomBookOverridePayload({ authors: [author.id] });
      const response1 = await booksApiRequest.createBook(payload1);
      expect(response1.status()).toBe(HTTP_201_CREATED);
      const body1 = await parseResponse<BookResponse>(response1);
      assertCreatedResponseHeaders(response1, body1.id);
      assertBookSchema(body1);
      assertNoUnexpectedBookProperties(body1);
      createdBookIds.push(body1.id);

      const payload2 = getRandomBookOverridePayload({ authors: [author.id] });
      const response2 = await booksApiRequest.createBook(payload2);
      expect(response2.status()).toBe(HTTP_201_CREATED);
      const body2 = await parseResponse<BookResponse>(response2);
      assertCreatedResponseHeaders(response2, body2.id);
      assertBookSchema(body2);
      assertNoUnexpectedBookProperties(body2);
      createdBookIds.push(body2.id);

      expect(body1.id).not.toBe(body2.id);

      const found = await booksApiSteps.getBooks({ author: author.lastName });
      const ids = found.map((b) => b.id);
      expect(ids).toContain(body1.id);
      expect(ids).toContain(body2.id);
      expect(
        found.every((book) => book.authors.some((bookAuthor) => bookAuthor.lastName === author.lastName)),
        'all returned books should match author filter',
      ).toBe(true);
    },
  );
});
