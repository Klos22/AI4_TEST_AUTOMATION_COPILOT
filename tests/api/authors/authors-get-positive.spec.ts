import { test, expect } from '@fixtures/test.fixture';
import { APIResponse } from '@playwright/test';
import { getRandomAuthorOverridePayload, getRandomAuthorPayload } from '@api/factories/author.factory';
import { HTTP_200_OK } from '@api/consts/http.status.codes.const';
import { AuthorPayload, AuthorResponse, AuthorsSchema } from '@api/models/author.model';
import { parseResponse } from '@utils/parse.response.utils';
import { getRandomFirstName, getRandomLastName } from '@utils/random.data.utils';

const CONTENT_TYPE_JSON = 'application/json';

async function parseAndAssertAuthorsResponse(response: APIResponse): Promise<AuthorResponse[]> {
  expect(response.status()).toBe(HTTP_200_OK);
  expect(response.headers()['content-type']).toContain(CONTENT_TYPE_JSON);

  const body = await parseResponse<AuthorResponse[]>(response);
  const parsed = AuthorsSchema.safeParse(body);

  expect(parsed.success, parsed.success ? '' : parsed.error.message).toBe(true);

  return body;
}

function normalizeAuthorsById(authors: AuthorResponse[]): AuthorResponse[] {
  return [...authors].sort((a, b) => a.id - b.id);
}

function getDistinctValue(reference: string, pick: () => string): string {
  let candidate = pick();
  let retries = 0;

  while (
    (candidate === reference || candidate.includes(reference) || reference.includes(candidate)) &&
    retries < 10
  ) {
    candidate = pick();
    retries += 1;
  }

  return candidate;
}

test.describe('GET /authors 2xx', { tag: ['@api', '@authors', '@smoke'] }, () => {
  let authorA: AuthorPayload;
  let authorB: AuthorPayload;
  let authorC: AuthorPayload;
  let authorAId: number;
  let authorBId: number;
  let authorCId: number;
  const createdIds: number[] = [];

  test.beforeEach(async ({ authorsApiSteps }) => {
    authorA = getRandomAuthorPayload();
    const distinctLastName = getDistinctValue(authorA.lastName, getRandomLastName);
    const distinctFirstName = getDistinctValue(authorA.firstName, getRandomFirstName);

    authorB = getRandomAuthorOverridePayload({
      firstName: authorA.firstName,
      lastName: distinctLastName,
    });
    authorC = getRandomAuthorOverridePayload({
      firstName: distinctFirstName,
      lastName: authorA.lastName,
    });

    const createdA = await authorsApiSteps.createAuthor(authorA);
    authorAId = createdA.id;
    createdIds.push(createdA.id);

    const createdB = await authorsApiSteps.createAuthor(authorB);
    authorBId = createdB.id;
    createdIds.push(createdB.id);

    const createdC = await authorsApiSteps.createAuthor(authorC);
    authorCId = createdC.id;
    createdIds.push(createdC.id);
  });

  test.afterEach(async ({ authorsApiSteps }) => {
    for (const id of createdIds.splice(0)) {
      await authorsApiSteps.deleteAuthor(id);
    }
  });

  test('should return all authors without filters', async ({ authorsApiRequest }) => {
    const response = await authorsApiRequest.getAuthors();

    const body = await parseAndAssertAuthorsResponse(response);

    const found = body.find((a) => a.firstName === authorA.firstName && a.lastName === authorA.lastName);

    expect(found, 'authorA should be in the list').toBeDefined();
    expect(found?.id).toEqual(expect.any(Number));
    expect(found?.id).toBeGreaterThan(0);
  });

  test('should filter authors by firstName only', async ({ authorsApiRequest }) => {
    const response = await authorsApiRequest.getAuthors({ firstName: authorA.firstName });

    const body = await parseAndAssertAuthorsResponse(response);
    const lastNames = body.map((a) => a.lastName);
    const ids = body.map((a) => a.id);

    expect(lastNames).toContain(authorA.lastName);
    expect(lastNames).toContain(authorB.lastName);
    expect(ids).toContain(authorAId);
    expect(ids).toContain(authorBId);
    expect(ids).not.toContain(authorCId);
    expect(body.some((a) => a.firstName === authorC.firstName)).toBe(false);
    expect(body.every((a) => a.firstName === authorA.firstName)).toBe(true);
  });

  test('should filter authors by lastName only', async ({ authorsApiRequest }) => {
    const response = await authorsApiRequest.getAuthors({ lastName: authorA.lastName });

    const body = await parseAndAssertAuthorsResponse(response);
    const firstNames = body.map((a) => a.firstName);
    const ids = body.map((a) => a.id);

    expect(firstNames).toContain(authorA.firstName);
    expect(firstNames).toContain(authorC.firstName);
    expect(ids).toContain(authorAId);
    expect(ids).toContain(authorCId);
    expect(ids).not.toContain(authorBId);
    expect(body.some((a) => a.lastName === authorB.lastName)).toBe(false);
    expect(body.every((a) => a.lastName === authorA.lastName)).toBe(true);
  });

  test('should filter authors by firstName and lastName', async ({ authorsApiRequest }) => {
    const response = await authorsApiRequest.getAuthors({
      firstName: authorA.firstName,
      lastName: authorA.lastName,
    });

    const body = await parseAndAssertAuthorsResponse(response);

    expect(body).toHaveLength(1);
    expect(body[0].firstName).toBe(authorA.firstName);
    expect(body[0].lastName).toBe(authorA.lastName);
  });

  test('should return empty array when nothing matches', async ({ authorsApiRequest }) => {
    const nonMatching = getRandomAuthorPayload();

    const response = await authorsApiRequest.getAuthors({ firstName: nonMatching.firstName });

    const body = await parseAndAssertAuthorsResponse(response);

    expect(body).toEqual([]);
  });

  test('should return author created via POST in GET', async ({ authorsApiSteps, authorsApiRequest }) => {
    const newAuthor = getRandomAuthorPayload();

    const created = await authorsApiSteps.createAuthor(newAuthor);
    createdIds.push(created.id);

    const response = await authorsApiRequest.getAuthors({
      firstName: newAuthor.firstName,
      lastName: newAuthor.lastName,
    });

    const body = await parseAndAssertAuthorsResponse(response);

    expect(body).toHaveLength(1);
    expect(body[0].firstName).toBe(newAuthor.firstName);
    expect(body[0].lastName).toBe(newAuthor.lastName);
  });

  test('should return list item consistent with GET /authors/{id}', async ({ authorsApiRequest, authorsApiSteps }) => {
    const listResponse = await authorsApiRequest.getAuthors({
      firstName: authorA.firstName,
      lastName: authorA.lastName,
    });

    const list = await parseAndAssertAuthorsResponse(listResponse);

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

    const firstBody = await parseAndAssertAuthorsResponse(first);
    const secondBody = await parseAndAssertAuthorsResponse(second);

    expect(normalizeAuthorsById(secondBody)).toEqual(normalizeAuthorsById(firstBody));
  });
});
