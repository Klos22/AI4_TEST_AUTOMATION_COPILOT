import { test, expect } from '@fixtures/test.fixture';
import {
  HTTP_200_OK,
  HTTP_300_MULTIPLE_CHOICES,
  HTTP_500_INTERNAL_SERVER_ERROR,
} from '@api/consts/http.status.codes.const';
import { getRandomAuthorPayload } from '@api/factories/author.factory';
import { AuthorResponse, AuthorsSchema } from '@api/models/author.model';
import { QueryParams } from '@api/requests/api.request';
import { parseResponse } from '@utils/parse.response.utils';
import { getRandomFirstName, getRandomLowerCaseString, getRandomWord } from '@utils/random.data.utils';

const emptyFilterDatasets: { description: string; params: QueryParams }[] = [
  { description: 'empty string filter values', params: { firstName: '', lastName: '' } },
  { description: 'whitespace-only filter value', params: { firstName: '   ' } },
];

test.describe('GET /authors 4xx', { tag: ['@api', '@authors', '@regression'] }, () => {
  test.describe.configure({ mode: 'serial' });

  const createdIds: number[] = [];

  test.afterEach(async ({ authorsApiSteps }) => {
    for (const id of createdIds.splice(0)) {
      await authorsApiSteps.deleteAuthor(id);
    }
  });

  emptyFilterDatasets.forEach(({ description, params }) => {
    test(`should not fail with server error for ${description}`, async ({ authorsApiRequest }) => {
      const response = await authorsApiRequest.getAuthors(params);

      expect(response.status()).toBeLessThan(HTTP_500_INTERNAL_SERVER_ERROR);

      if (response.status() === HTTP_200_OK) {
        const body = await parseResponse<AuthorResponse[]>(response);
        expect(AuthorsSchema.safeParse(body).success).toBeTruthy();
        test.info().annotations.push({ type: 'observed', description: `200, ${body.length} authors returned` });
      }
    });
  });

  test('should handle injection-like filter value safely', async ({ authorsApiRequest, authorsApiSteps }) => {
    const author = getRandomAuthorPayload();
    const created = await authorsApiSteps.createAuthor(author);
    createdIds.push(created.id);

    const response = await authorsApiRequest.getAuthors({ lastName: "'; DROP TABLE authors;--" });

    expect(response.status()).toBeLessThan(HTTP_500_INTERNAL_SERVER_ERROR);

    if (response.status() === HTTP_200_OK) {
      expect(await parseResponse<AuthorResponse[]>(response)).toEqual([]);
    }

    const after = await authorsApiSteps.getAuthors({ firstName: author.firstName, lastName: author.lastName });
    expect(AuthorsSchema.safeParse(after).success).toBeTruthy();
    expect(after).toHaveLength(1);
  });

  test('should handle very long filter value', async ({ authorsApiRequest }) => {
    const response = await authorsApiRequest.getAuthors({ firstName: getRandomLowerCaseString(1000) });

    expect(response.status()).toBeLessThan(HTTP_500_INTERNAL_SERVER_ERROR);

    if (response.status() === HTTP_200_OK) {
      expect(await parseResponse<AuthorResponse[]>(response)).toEqual([]);
    }
  });

  test('should ignore unknown query parameter', async ({ authorsApiRequest }) => {
    const unknownResponse = await authorsApiRequest.getAuthors({ unknown: getRandomWord() });

    expect(unknownResponse.status()).toBeLessThan(HTTP_500_INTERNAL_SERVER_ERROR);

    if (unknownResponse.status() === HTTP_200_OK) {
      // Other specs create/delete authors in parallel, so compare both lists fetched together until stable
      await expect
        .poll(
          async () => {
            const withParam = await authorsApiRequest.getAuthors({ unknown: 'abc' });
            const without = await authorsApiRequest.getAuthors();
            return (
              JSON.stringify(await parseResponse<AuthorResponse[]>(withParam)) ===
              JSON.stringify(await parseResponse<AuthorResponse[]>(without))
            );
          },
          { timeout: 20_000 },
        )
        .toBeTruthy();
    }
  });

  test('should handle duplicated filter parameter', async ({ authorsApiRequest }) => {
    const response = await authorsApiRequest.getAuthorsByRawQuery(
      `firstName=${getRandomFirstName()}&firstName=${getRandomFirstName()}`,
    );

    expect(response.status()).toBeLessThan(HTTP_500_INTERNAL_SERVER_ERROR);

    if (response.status() === HTTP_200_OK) {
      const body = await parseResponse<AuthorResponse[]>(response);
      expect(AuthorsSchema.safeParse(body).success).toBeTruthy();
    }
  });

  test('should handle unsupported Accept header', async ({ authorsApiRequest }) => {
    const response = await authorsApiRequest.getAuthors(undefined, { Accept: 'application/xml' });

    expect(response.status()).toBeLessThan(HTTP_500_INTERNAL_SERVER_ERROR);

    if (response.status() === HTTP_200_OK) {
      const body = await parseResponse<AuthorResponse[]>(response);
      expect(AuthorsSchema.safeParse(body).success).toBeTruthy();
    }
  });

  test('should reject DELETE /authors and not delete data', async ({ authorsApiRequest, authorsApiSteps }) => {
    const author = getRandomAuthorPayload();
    const created = await authorsApiSteps.createAuthor(author);
    createdIds.push(created.id);

    const response = await authorsApiRequest.deleteAuthors();

    expect(response.status()).toBeGreaterThanOrEqual(HTTP_300_MULTIPLE_CHOICES);
    expect(response.status()).toBeLessThan(HTTP_500_INTERNAL_SERVER_ERROR);

    const after = await authorsApiSteps.getAuthors({ firstName: author.firstName, lastName: author.lastName });
    expect(AuthorsSchema.parse(after)).toHaveLength(1);
  });
});
