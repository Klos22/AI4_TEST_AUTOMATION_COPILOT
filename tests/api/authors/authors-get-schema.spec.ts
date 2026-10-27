import { test, expect } from '@fixtures/test.fixture';
import { HTTP_200_OK } from '@api/consts/http.status.codes.const';
import { getRandomAuthorPayload } from '@api/factories/author.factory';
import { AuthorPayload, AuthorResponse, AuthorsSchema } from '@api/models/author.model';
import { getRandomLastName, getRandomLowerCaseString } from '@utils/random.data.utils';
import { parseResponse } from '@utils/parse.response.utils';

const CONTENT_TYPE_JSON = 'application/json';
const ALLOWED_AUTHOR_PROPERTIES = ['id', 'firstName', 'lastName'];

function assertAuthorsSchema(body: AuthorResponse[]): void {
  const result = AuthorsSchema.safeParse(body);
  expect(result.success, result.success ? '' : result.error.message).toBe(true);
}

test.describe('GET /authors schema', { tag: ['@api', '@authors', '@schema', '@smoke'] }, () => {
  let author: AuthorPayload;
  let createdId: number | undefined;

  test.beforeEach(async ({ authorsApiSteps }) => {
    author = getRandomAuthorPayload();
    const created = await authorsApiSteps.createAuthor(author);
    createdId = created.id;
  });

  test.afterEach(async ({ authorsApiSteps }) => {
    if (createdId !== undefined) {
      await authorsApiSteps.deleteAuthor(createdId);
      createdId = undefined;
    }
  });

  test('should return status 200 and JSON array content type', async ({ authorsApiRequest }) => {
    const response = await authorsApiRequest.getAuthors();

    expect(response.status()).toBe(HTTP_200_OK);
    expect(response.headers()['content-type']).toContain(CONTENT_TYPE_JSON);

    const body = await parseResponse<AuthorResponse[]>(response);

    expect(Array.isArray(body)).toBe(true);
    assertAuthorsSchema(body);
  });

  test('should return array items matching Author schema', async ({ authorsApiRequest }) => {
    const response = await authorsApiRequest.getAuthors();

    expect(response.status()).toBe(HTTP_200_OK);
    expect(response.headers()['content-type']).toContain(CONTENT_TYPE_JSON);

    const body = await parseResponse<AuthorResponse[]>(response);

    expect(body.length).toBeGreaterThan(0);
    assertAuthorsSchema(body);

    const ids = body.map((item) => item.id);

    expect(new Set(ids).size, 'ids should be unique').toBe(ids.length);
    expect(ids.every((id) => Number.isInteger(id))).toBe(true);
  });

  test('should not return unexpected properties in items', async ({ authorsApiRequest }) => {
    const response = await authorsApiRequest.getAuthors();

    expect(response.status()).toBe(HTTP_200_OK);
    expect(response.headers()['content-type']).toContain(CONTENT_TYPE_JSON);

    const body = await parseResponse<AuthorResponse[]>(response);
    assertAuthorsSchema(body);

    for (const item of body) {
      const keys = Object.keys(item);
      expect(ALLOWED_AUTHOR_PROPERTIES, `item ${JSON.stringify(item)}`).toEqual(expect.arrayContaining(keys));
      expect(keys, `item ${JSON.stringify(item)}`).toEqual(expect.arrayContaining(ALLOWED_AUTHOR_PROPERTIES));
    }
  });

  test('should return filtered response matching Author schema', async ({ authorsApiRequest }) => {
    const response = await authorsApiRequest.getAuthors({
      firstName: author.firstName,
      lastName: author.lastName,
    });

    expect(response.status()).toBe(HTTP_200_OK);
    expect(response.headers()['content-type']).toContain(CONTENT_TYPE_JSON);

    const body = await parseResponse<AuthorResponse[]>(response);
    assertAuthorsSchema(body);
    expect(body.length).toBeGreaterThanOrEqual(1);
    expect(body.some((a) => a.firstName === author.firstName && a.lastName === author.lastName)).toBe(true);
  });

  test('should return an empty array when no author matches the filter', async ({ authorsApiRequest }) => {
    const nonMatchingLastName = `${author.lastName}${getRandomLowerCaseString(8)}`;
    const response = await authorsApiRequest.getAuthors({ lastName: nonMatchingLastName });

    expect(response.status()).toBe(HTTP_200_OK);
    expect(response.headers()['content-type']).toContain(CONTENT_TYPE_JSON);

    const body = await parseResponse<AuthorResponse[]>(response);

    expect(Array.isArray(body)).toBe(true);
    assertAuthorsSchema(body);
    expect(body).toEqual([]);
  });
});
