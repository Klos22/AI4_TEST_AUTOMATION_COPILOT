import { test, expect } from '@fixtures/test.fixture';
import { APIResponse } from '@playwright/test';
import { HTTP_201_CREATED } from '@api/consts/http.status.codes.const';
import { getRandomAuthorOverridePayload, getRandomAuthorPayload } from '@api/factories/author.factory';
import { AuthorPayload, AuthorResponse } from '@api/models/author.model';
import { AuthorsAPIRequest } from '@api/requests/authors/authors.api.request';
import { parseResponse } from '@utils/parse.response.utils';
import { getRandomLowerCaseString } from '@utils/random.data.utils';

const MIN_NAME_LENGTH = 3;
const MAX_NAME_LENGTH = 128;

const createDatasets: { id: string; description: string; buildPayload: () => AuthorPayload }[] = [
  {
    id: 'TC-AUTHORS-POST-POSITIVE-001',
    description: 'with firstName and lastName',
    buildPayload: getRandomAuthorPayload,
  },
  {
    id: 'TC-AUTHORS-POST-POSITIVE-002',
    description: `with minimum name lengths (${MIN_NAME_LENGTH}/${MIN_NAME_LENGTH})`,
    buildPayload: () =>
      getRandomAuthorOverridePayload({
        firstName: getRandomLowerCaseString(MIN_NAME_LENGTH),
        lastName: getRandomLowerCaseString(MIN_NAME_LENGTH),
      }),
  },
  {
    id: 'TC-AUTHORS-POST-POSITIVE-003',
    description: `with maximum name lengths (${MAX_NAME_LENGTH}/${MAX_NAME_LENGTH})`,
    buildPayload: () =>
      getRandomAuthorOverridePayload({
        firstName: getRandomLowerCaseString(MAX_NAME_LENGTH),
        lastName: getRandomLowerCaseString(MAX_NAME_LENGTH),
      }),
  },
];

test.describe('POST /authors 2xx', { tag: ['@api', '@authors', '@smoke'] }, () => {
  const createdIds: number[] = [];

  test.afterEach(async ({ authorsApiSteps }) => {
    for (const id of createdIds.splice(0)) {
      await authorsApiSteps.deleteAuthor(id);
    }
  });

  async function createAuthor(
    authorsApiRequest: AuthorsAPIRequest,
    payload: AuthorPayload,
  ): Promise<{ response: APIResponse; created: AuthorResponse }> {
    const response = await authorsApiRequest.createAuthor(payload);
    expect(response.status()).toBe(HTTP_201_CREATED);
    expect(response.headers()['content-type']).toContain('application/json');
    const created = await parseResponse<AuthorResponse>(response);
    createdIds.push(created.id);
    return { response, created };
  }

  createDatasets.forEach(({ id, description, buildPayload }) => {
    test(
      `should create author ${description}`,
      { annotation: { type: 'scenario', description: id } },
      async ({ authorsApiRequest, authorsApiSteps }) => {
        const payload = buildPayload();

        const { response, created } = await createAuthor(authorsApiRequest, payload);

        expect(Number.isInteger(created.id), 'body.id should be an integer').toBe(true);
        expect(created.firstName).toBe(payload.firstName);
        expect(created.lastName).toBe(payload.lastName);
        expect(response.headers()['location'], '201 Created should return location header').toMatch(
          new RegExp(`/authors/${created.id}$`),
        );

        const author = await authorsApiSteps.getAuthorById(created.id);
        expect(author.firstName).toBe(payload.firstName);
        expect(author.lastName).toBe(payload.lastName);
      },
    );
  });

  test(
    'should find created author via filtered list',
    { annotation: { type: 'scenario', description: 'TC-AUTHORS-POST-POSITIVE-004' } },
    async ({ authorsApiRequest, authorsApiSteps }) => {
      const payload = getRandomAuthorPayload();

      const { created } = await createAuthor(authorsApiRequest, payload);

      const authors = await authorsApiSteps.getAuthors({
        firstName: payload.firstName,
        lastName: payload.lastName,
      });

      expect(Array.isArray(authors)).toBe(true);
      expect(authors).toContainEqual({ id: created.id, firstName: payload.firstName, lastName: payload.lastName });
    },
  );
});
