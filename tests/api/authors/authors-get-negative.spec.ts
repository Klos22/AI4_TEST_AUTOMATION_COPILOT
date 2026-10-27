import { test, expect } from '@fixtures/test.fixture';
import {
  HTTP_200_OK,
  HTTP_405_METHOD_NOT_ALLOWED,
  HTTP_406_NOT_ACCEPTABLE,
} from '@api/consts/http.status.codes.const';
import { getRandomAuthorPayload } from '@api/factories/author.factory';
import { AuthorResponse, AuthorsSchema } from '@api/models/author.model';
import { QueryParams } from '@api/requests/api.request';
import { parseResponse } from '@utils/parse.response.utils';
import { getRandomFirstName, getRandomLowerCaseString, getRandomWord } from '@utils/random.data.utils';

const CONTENT_TYPE_JSON = 'application/json';
const VERY_LONG_FILTER = 1000;

type ErrorResponse = {
  status: number;
  error: string;
  message?: string | string[];
  path?: string;
};

function assertAuthorsSchema(body: AuthorResponse[]): void {
  const parsed = AuthorsSchema.safeParse(body);
  expect(parsed.success, parsed.success ? '' : parsed.error.message).toBe(true);
}

function normalizeById(items: AuthorResponse[]): AuthorResponse[] {
  return [...items].sort((a, b) => a.id - b.id);
}

const emptyFilterDatasets: { description: string; params: QueryParams; expectedStatus: number }[] = [
  { description: 'empty string filter values', params: { firstName: '', lastName: '' }, expectedStatus: HTTP_200_OK },
  { description: 'whitespace-only filter value', params: { firstName: '   ' }, expectedStatus: HTTP_200_OK },
];

test.describe('GET /authors negative and robustness', { tag: ['@api', '@authors', '@regression'] }, () => {
  test.describe.configure({ mode: 'serial' });

  const createdIds: number[] = [];

  test.afterEach(async ({ authorsApiSteps }) => {
    for (const id of createdIds.splice(0)) {
      await authorsApiSteps.deleteAuthor(id);
    }
  });

  emptyFilterDatasets.forEach(({ description, params, expectedStatus }) => {
    test(`should not fail with server error for ${description}`, async ({ authorsApiRequest }) => {
      const response = await authorsApiRequest.getAuthors(params);

      expect(response.status()).toBe(expectedStatus);
      expect(response.headers()['content-type']).toContain(CONTENT_TYPE_JSON);

      const body = await parseResponse<AuthorResponse[]>(response);
      assertAuthorsSchema(body);
      test.info().annotations.push({ type: 'observed', description: `200, ${body.length} authors returned` });
    });
  });

  test('should handle injection-like filter value safely', async ({ authorsApiRequest, authorsApiSteps }) => {
    const author = getRandomAuthorPayload();
    const created = await authorsApiSteps.createAuthor(author);
    createdIds.push(created.id);

    const response = await authorsApiRequest.getAuthors({ lastName: "'; DROP TABLE authors;--" });

    expect(response.status()).toBe(HTTP_200_OK);
    expect(response.headers()['content-type']).toContain(CONTENT_TYPE_JSON);

    expect(await parseResponse<AuthorResponse[]>(response)).toEqual([]);

    const after = await authorsApiSteps.getAuthors({ firstName: author.firstName, lastName: author.lastName });
    assertAuthorsSchema(after);
    expect(after).toHaveLength(1);
  });

  test('should handle very long filter value', async ({ authorsApiRequest }) => {
    const response = await authorsApiRequest.getAuthors({ firstName: getRandomLowerCaseString(VERY_LONG_FILTER) });

    expect(response.status()).toBe(HTTP_200_OK);
    expect(response.headers()['content-type']).toContain(CONTENT_TYPE_JSON);

    expect(await parseResponse<AuthorResponse[]>(response)).toEqual([]);
  });

  test('should ignore unknown query parameter', async ({ authorsApiRequest }) => {
    const unknownResponse = await authorsApiRequest.getAuthors({ unknown: getRandomWord() });

    expect(unknownResponse.status()).toBe(HTTP_200_OK);
    expect(unknownResponse.headers()['content-type']).toContain(CONTENT_TYPE_JSON);

    // Other specs create/delete authors in parallel, so compare both lists fetched together until stable
    await expect
      .poll(
        async () => {
          const withParam = await authorsApiRequest.getAuthors({ unknown: 'abc' });
          const without = await authorsApiRequest.getAuthors();
          const withParamBody = await parseResponse<AuthorResponse[]>(withParam);
          const withoutBody = await parseResponse<AuthorResponse[]>(without);

          assertAuthorsSchema(withParamBody);
          assertAuthorsSchema(withoutBody);

          return JSON.stringify(normalizeById(withParamBody)) === JSON.stringify(normalizeById(withoutBody));
        },
        { timeout: 20_000 },
      )
      .toBe(true);
  });

  test('should handle duplicated filter parameter', async ({ authorsApiRequest }) => {
    const response = await authorsApiRequest.getAuthorsByRawQuery(
      `firstName=${getRandomFirstName()}&firstName=${getRandomFirstName()}`,
    );

    expect(response.status()).toBe(HTTP_200_OK);
    expect(response.headers()['content-type']).toContain(CONTENT_TYPE_JSON);

    const body = await parseResponse<AuthorResponse[]>(response);
    assertAuthorsSchema(body);
  });

  test('should handle unsupported Accept header', async ({ authorsApiRequest }) => {
    const response = await authorsApiRequest.getAuthors(undefined, { Accept: 'application/xml' });

    expect(response.status()).toBe(HTTP_406_NOT_ACCEPTABLE);
    expect(response.headers()['content-type'] ?? '').toBe('');
    expect(await response.text()).toBe('');
  });

  test('should return consistent error contract for DELETE /authors', async ({ authorsApiRequest }) => {
    const response = await authorsApiRequest.deleteAuthors();

    expect(response.status()).toBe(HTTP_405_METHOD_NOT_ALLOWED);
    expect(response.headers()['content-type']).toContain(CONTENT_TYPE_JSON);

    const body = await parseResponse<ErrorResponse>(response);

    expect(body.status).toBe(HTTP_405_METHOD_NOT_ALLOWED);
    expect(body.error).toBe('Method Not Allowed');
    expect(body.path).toBe('/authors');
  });

  test('should reject DELETE /authors and not delete data', async ({ authorsApiRequest, authorsApiSteps }) => {
    const author = getRandomAuthorPayload();
    const created = await authorsApiSteps.createAuthor(author);
    createdIds.push(created.id);

    const response = await authorsApiRequest.deleteAuthors();

    expect(response.status()).toBe(HTTP_405_METHOD_NOT_ALLOWED);
    expect(response.headers()['content-type']).toContain(CONTENT_TYPE_JSON);

    const deleteErrorBody = await parseResponse<ErrorResponse>(response);
    expect(deleteErrorBody.status).toBe(HTTP_405_METHOD_NOT_ALLOWED);
    expect(deleteErrorBody.error).toBe('Method Not Allowed');

    const after = await authorsApiSteps.getAuthors({ firstName: author.firstName, lastName: author.lastName });
    expect(AuthorsSchema.parse(after)).toHaveLength(1);
  });
});
