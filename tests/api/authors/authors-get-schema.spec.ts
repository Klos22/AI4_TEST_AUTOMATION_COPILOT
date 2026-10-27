import { test, expect } from '@fixtures/test.fixture';
import { HTTP_200_OK } from '@api/consts/http.status.codes.const';
import { getRandomAuthorPayload } from '@api/factories/author.factory';
import { AuthorPayload, AuthorResponse, AuthorsSchema } from '@api/models/author.model';
import { getRandomLastName } from '@utils/random.data.utils';
import { parseResponse } from '@utils/parse.response.utils';

const CONTENT_TYPE_JSON = 'application/json';
const ALLOWED_AUTHOR_PROPERTIES = ['id', 'firstName', 'lastName'];

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

    expect(Array.isArray(body)).toBeTruthy();
  });

  test('should return array items matching Author schema', async ({ authorsApiSteps }) => {
    const body = await authorsApiSteps.getAuthors();

    expect(body.length).toBeGreaterThan(0);

    const result = AuthorsSchema.safeParse(body);

    expect(result.success, result.success ? '' : result.error.message).toBeTruthy();

    const ids = body.map((item) => item.id);

    expect(new Set(ids).size, 'ids should be unique').toBe(ids.length);
    expect(ids.every((id) => Number.isSafeInteger(id))).toBeTruthy();
  });

  test('should not return unexpected properties in items', async ({ authorsApiSteps }) => {
    const body = await authorsApiSteps.getAuthors();

    for (const item of body) {
      expect(ALLOWED_AUTHOR_PROPERTIES, `item ${JSON.stringify(item)}`).toEqual(
        expect.arrayContaining(Object.keys(item)),
      );
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
    const result = AuthorsSchema.safeParse(body);

    expect(result.success, result.success ? '' : result.error.message).toBeTruthy();
    expect(body.length).toBeGreaterThanOrEqual(1);
  });

  test('should return an empty array when no author matches the filter', async ({ authorsApiRequest }) => {
    const response = await authorsApiRequest.getAuthors({ lastName: getRandomLastName() });

    expect(response.status()).toBe(HTTP_200_OK);
    expect(response.headers()['content-type']).toContain(CONTENT_TYPE_JSON);

    const body = await parseResponse<AuthorResponse[]>(response);

    expect(Array.isArray(body)).toBeTruthy();
    expect(body).toHaveLength(0);
  });
});
