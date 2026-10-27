import { test, expect } from '@fixtures/test.fixture';
import { getRandomAuthorOverridePayload, getRandomAuthorPayload } from '@api/factories/author.factory';
import { HTTP_200_OK } from '@api/consts/http.status.codes.const';
import { AuthorPayload, AuthorResponse } from '@api/models/author.model';
import { parseResponse } from '@utils/parse.response.utils';

test.describe('GET /authors 2xx', { tag: ['@api', '@authors', '@smoke'] }, () => {
  let authorA: AuthorPayload;
  let authorB: AuthorPayload;
  let authorC: AuthorPayload;
  const createdIds: number[] = [];

  test.beforeEach(async ({ authorsApiSteps }) => {
    authorA = getRandomAuthorPayload();
    authorB = getRandomAuthorOverridePayload({ firstName: authorA.firstName });
    authorC = getRandomAuthorOverridePayload({ lastName: authorA.lastName });

    for (const author of [authorA, authorB, authorC]) {
      const created = await authorsApiSteps.createAuthor(author);
      createdIds.push(created.id);
    }
  });

  test.afterEach(async ({ authorsApiSteps }) => {
    for (const id of createdIds.splice(0)) {
      await authorsApiSteps.deleteAuthor(id);
    }
  });

  test('should return all authors without filters', async ({ authorsApiRequest }) => {
    const response = await authorsApiRequest.getAuthors();

    expect(response.status()).toBe(HTTP_200_OK);

    const body = await parseResponse<AuthorResponse[]>(response);

    expect(Array.isArray(body)).toBeTruthy();

    const found = body.find((a) => a.firstName === authorA.firstName && a.lastName === authorA.lastName);

    expect(found, 'authorA should be in the list').toBeDefined();
    expect(Number.isInteger(found?.id)).toBeTruthy();
  });

  test('should filter authors by firstName only', async ({ authorsApiRequest }) => {
    const response = await authorsApiRequest.getAuthors({ firstName: authorA.firstName });

    expect(response.status()).toBe(HTTP_200_OK);

    const body = await parseResponse<AuthorResponse[]>(response);
    const lastNames = body.map((a) => a.lastName);

    expect(lastNames).toContain(authorA.lastName);
    expect(lastNames).toContain(authorB.lastName);
    expect(body.some((a) => a.firstName === authorC.firstName)).toBeFalsy();
    expect(body.every((a) => a.firstName === authorA.firstName)).toBeTruthy();
  });

  test('should filter authors by lastName only', async ({ authorsApiRequest }) => {
    const response = await authorsApiRequest.getAuthors({ lastName: authorA.lastName });

    expect(response.status()).toBe(HTTP_200_OK);

    const body = await parseResponse<AuthorResponse[]>(response);
    const firstNames = body.map((a) => a.firstName);

    expect(firstNames).toContain(authorA.firstName);
    expect(firstNames).toContain(authorC.firstName);
    expect(body.some((a) => a.lastName === authorB.lastName)).toBeFalsy();
    expect(body.every((a) => a.lastName === authorA.lastName)).toBeTruthy();
  });

  test('should filter authors by firstName and lastName', async ({ authorsApiRequest }) => {
    const response = await authorsApiRequest.getAuthors({
      firstName: authorA.firstName,
      lastName: authorA.lastName,
    });

    expect(response.status()).toBe(HTTP_200_OK);

    const body = await parseResponse<AuthorResponse[]>(response);

    expect(body).toHaveLength(1);
    expect(body[0].firstName).toBe(authorA.firstName);
    expect(body[0].lastName).toBe(authorA.lastName);
  });

  test('should return empty array when nothing matches', async ({ authorsApiRequest }) => {
    const nonMatching = getRandomAuthorPayload();

    const response = await authorsApiRequest.getAuthors({ firstName: nonMatching.firstName });

    expect(response.status()).toBe(HTTP_200_OK);

    const body = await parseResponse<AuthorResponse[]>(response);

    expect(Array.isArray(body)).toBeTruthy();
    expect(body).toHaveLength(0);
  });

  test('should return author created via POST in GET', async ({ authorsApiSteps, authorsApiRequest }) => {
    const newAuthor = getRandomAuthorPayload();

    const created = await authorsApiSteps.createAuthor(newAuthor);
    createdIds.push(created.id);

    const response = await authorsApiRequest.getAuthors({
      firstName: newAuthor.firstName,
      lastName: newAuthor.lastName,
    });

    expect(response.status()).toBe(HTTP_200_OK);

    const body = await parseResponse<AuthorResponse[]>(response);

    expect(body).toHaveLength(1);
    expect(body[0].firstName).toBe(newAuthor.firstName);
    expect(body[0].lastName).toBe(newAuthor.lastName);
  });

  test('should return list item consistent with GET /authors/{id}', async ({ authorsApiRequest, authorsApiSteps }) => {
    const listResponse = await authorsApiRequest.getAuthors({
      firstName: authorA.firstName,
      lastName: authorA.lastName,
    });

    expect(listResponse.status()).toBe(HTTP_200_OK);

    const list = await parseResponse<AuthorResponse[]>(listResponse);

    expect(list).toHaveLength(1);

    const byId = await authorsApiSteps.getAuthorById(list[0].id);

    expect(byId.id).toBe(list[0].id);
    expect(byId.firstName).toBe(list[0].firstName);
    expect(byId.lastName).toBe(list[0].lastName);
  });

  test('should return the same result for repeated identical requests', async ({ authorsApiRequest }) => {
    const params = { firstName: authorA.firstName, lastName: authorA.lastName };

    const first = await authorsApiRequest.getAuthors(params);
    const second = await authorsApiRequest.getAuthors(params);

    expect(first.status()).toBe(HTTP_200_OK);
    expect(second.status()).toBe(HTTP_200_OK);
    expect(await parseResponse<AuthorResponse[]>(second)).toEqual(await parseResponse<AuthorResponse[]>(first));
  });
});
