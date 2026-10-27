import { test, expect } from '@fixtures/test.fixture';
import { faker } from '@faker-js/faker';
import type { APIRequestContext } from '@playwright/test';

const API_URL = 'https://bookstoreapi.up.railway.app';

interface AuthorData {
  firstName: string;
  lastName: string;
}

interface AuthorResponse extends AuthorData {
  id: number;
}

// API accepts letters only in names, so uniqueness comes from a random lowercase suffix
const uniqueName = (prefix: string): string => `${prefix}${faker.string.alpha({ length: 10, casing: 'lower' })}`;

async function createAuthor(request: APIRequestContext, author: AuthorData): Promise<void> {
  const response = await request.post(`${API_URL}/authors`, { data: author });
  expect(response.status(), 'precondition: POST /authors').toBe(201);
}

async function findAuthors(request: APIRequestContext, query: Partial<AuthorData>): Promise<AuthorResponse[]> {
  const response = await request.get(`${API_URL}/authors`, {
    headers: { Accept: 'application/json' },
    params: query,
  });
  expect(response.status(), 'lookup: GET /authors').toBe(200);
  return response.json();
}

test.describe('GET /authors - positive', () => {
  let authorA: AuthorData;
  let authorB: AuthorData;
  let authorC: AuthorData;
  const createdLastNames: string[] = [];

  test.beforeEach(async ({ request }) => {
    const sharedFirstName = uniqueName('Afirst');
    const sharedLastName = uniqueName('Alast');

    authorA = { firstName: sharedFirstName, lastName: sharedLastName };
    authorB = { firstName: sharedFirstName, lastName: uniqueName('Blast') };
    authorC = { firstName: uniqueName('Cfirst'), lastName: sharedLastName };

    for (const author of [authorA, authorB, authorC]) {
      await createAuthor(request, author);
    }
    createdLastNames.push(authorA.lastName, authorB.lastName);
  });

  test.afterEach(async ({ request }) => {
    for (const lastName of createdLastNames.splice(0)) {
      const authors = await findAuthors(request, { lastName });
      for (const author of authors) {
        const response = await request.delete(`${API_URL}/authors/${author.id}`);
        expect(response.status(), 'cleanup: DELETE /authors/{id}').toBe(204);
      }
    }
  });

  test('TC-AUTHORS-GET-POS-001 returns all authors without filters', async ({ request }) => {
    const response = await request.get(`${API_URL}/authors`, {
      headers: { Accept: 'application/json' },
    });

    expect(response.status()).toBe(200);

    const body: AuthorResponse[] = await response.json();

    expect(Array.isArray(body)).toBeTruthy();

    const found = body.find((a) => a.firstName === authorA.firstName && a.lastName === authorA.lastName);

    expect(found, 'authorA should be in the list').toBeDefined();
    expect(Number.isInteger(found?.id)).toBeTruthy();
  });

  test('TC-AUTHORS-GET-POS-002 filters by firstName only', async ({ request }) => {
    const response = await request.get(`${API_URL}/authors`, {
      headers: { Accept: 'application/json' },
      params: { firstName: authorA.firstName },
    });

    expect(response.status()).toBe(200);

    const body: AuthorResponse[] = await response.json();
    const lastNames = body.map((a) => a.lastName);

    expect(lastNames).toContain(authorA.lastName);
    expect(lastNames).toContain(authorB.lastName);
    expect(body.some((a) => a.firstName === authorC.firstName)).toBeFalsy();
    expect(body.every((a) => a.firstName === authorA.firstName)).toBeTruthy();
  });

  test('TC-AUTHORS-GET-POS-003 filters by lastName only', async ({ request }) => {
    const response = await request.get(`${API_URL}/authors`, {
      headers: { Accept: 'application/json' },
      params: { lastName: authorA.lastName },
    });

    expect(response.status()).toBe(200);

    const body: AuthorResponse[] = await response.json();
    const firstNames = body.map((a) => a.firstName);

    expect(firstNames).toContain(authorA.firstName);
    expect(firstNames).toContain(authorC.firstName);
    expect(body.some((a) => a.lastName === authorB.lastName)).toBeFalsy();
    expect(body.every((a) => a.lastName === authorA.lastName)).toBeTruthy();
  });

  test('TC-AUTHORS-GET-POS-004 filters by firstName and lastName', async ({ request }) => {
    const response = await request.get(`${API_URL}/authors`, {
      headers: { Accept: 'application/json' },
      params: { firstName: authorA.firstName, lastName: authorA.lastName },
    });

    expect(response.status()).toBe(200);

    const body: AuthorResponse[] = await response.json();

    expect(body).toHaveLength(1);
    expect(body[0].firstName).toBe(authorA.firstName);
    expect(body[0].lastName).toBe(authorA.lastName);
  });

  test('TC-AUTHORS-GET-POS-005 returns empty array when nothing matches', async ({ request }) => {
    const nonMatching = uniqueName('Nonexistent');

    const response = await request.get(`${API_URL}/authors`, {
      headers: { Accept: 'application/json' },
      params: { firstName: nonMatching },
    });

    expect(response.status()).toBe(200);

    const body: AuthorResponse[] = await response.json();

    expect(Array.isArray(body)).toBeTruthy();
    expect(body).toHaveLength(0);
  });

  test('TC-AUTHORS-GET-POS-006 author created via POST is visible in GET', async ({ request }) => {
    const newAuthor: AuthorData = {
      firstName: uniqueName('Newfirst'),
      lastName: uniqueName('Newlast'),
    };

    const postResponse = await request.post(`${API_URL}/authors`, { data: newAuthor });
    expect(postResponse.status()).toBe(201);
    createdLastNames.push(newAuthor.lastName);

    const response = await request.get(`${API_URL}/authors`, {
      headers: { Accept: 'application/json' },
      params: { firstName: newAuthor.firstName, lastName: newAuthor.lastName },
    });

    expect(response.status()).toBe(200);

    const body: AuthorResponse[] = await response.json();

    expect(body).toHaveLength(1);
    expect(body[0].firstName).toBe(newAuthor.firstName);
    expect(body[0].lastName).toBe(newAuthor.lastName);
  });

  test('TC-AUTHORS-GET-POS-007 list item is consistent with GET /authors/{id}', async ({ request }) => {
    const listResponse = await request.get(`${API_URL}/authors`, {
      headers: { Accept: 'application/json' },
      params: { firstName: authorA.firstName, lastName: authorA.lastName },
    });

    expect(listResponse.status()).toBe(200);

    const list: AuthorResponse[] = await listResponse.json();

    expect(list).toHaveLength(1);

    const byIdResponse = await request.get(`${API_URL}/authors/${list[0].id}`, {
      headers: { Accept: 'application/json' },
    });

    expect(byIdResponse.status()).toBe(200);

    const byId: AuthorResponse = await byIdResponse.json();

    expect(byId.id).toBe(list[0].id);
    expect(byId.firstName).toBe(list[0].firstName);
    expect(byId.lastName).toBe(list[0].lastName);
  });

  test('TC-AUTHORS-GET-POS-008 repeated identical requests return the same result', async ({ request }) => {
    const options = {
      headers: { Accept: 'application/json' },
      params: { firstName: authorA.firstName, lastName: authorA.lastName },
    };

    const first = await request.get(`${API_URL}/authors`, options);
    const second = await request.get(`${API_URL}/authors`, options);

    expect(first.status()).toBe(200);
    expect(second.status()).toBe(200);
    expect(await second.json()).toEqual(await first.json());
  });
});
