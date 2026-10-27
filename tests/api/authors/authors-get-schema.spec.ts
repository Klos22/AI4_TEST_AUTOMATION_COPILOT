import { test, expect } from '@fixtures/test.fixture';
import { faker } from '@faker-js/faker';
import { z } from 'zod';

const API_URL = 'https://bookstoreapi.up.railway.app';

// All fields are optional in OpenAPI (no `required` array)
const AuthorSchema = z.object({
  id: z.number().int().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});
const AuthorsSchema = z.array(AuthorSchema);

// API accepts letters only in names, so uniqueness comes from a random lowercase suffix
const uniqueName = (prefix: string): string => `${prefix}${faker.string.alpha({ length: 10, casing: 'lower' })}`;

const headers = { Accept: 'application/json' };

test.describe('GET /authors - schema', () => {
  let author: { firstName: string; lastName: string };

  test.beforeEach(async ({ request }) => {
    author = { firstName: uniqueName('Schema'), lastName: uniqueName('Author') };
    const response = await request.post(`${API_URL}/authors`, { data: author });
    expect(response.status(), 'precondition: POST /authors').toBe(201);
  });

  test.afterEach(async ({ request }) => {
    const lookup = await request.get(`${API_URL}/authors`, { headers, params: author });
    for (const { id } of AuthorsSchema.parse(await lookup.json())) {
      await request.delete(`${API_URL}/authors/${id}`);
    }
  });

  test('TC-AUTHORS-GET-SCHEMA-001 status code and content type', async ({ request }) => {
    const response = await request.get(`${API_URL}/authors`, { headers });

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    const body = await response.json();

    expect(Array.isArray(body)).toBeTruthy();
  });

  test('TC-AUTHORS-GET-SCHEMA-002 array items match Author schema', async ({ request }) => {
    const response = await request.get(`${API_URL}/authors`, { headers });

    expect(response.status()).toBe(200);

    const body = await response.json();

    expect(body.length).toBeGreaterThan(0);

    const result = AuthorsSchema.safeParse(body);

    expect(result.success, result.success ? '' : result.error.message).toBeTruthy();

    const ids = body.map((item: { id: number }) => item.id);

    expect(new Set(ids).size, 'ids should be unique').toBe(ids.length);
    expect(ids.every((id: number) => Number.isSafeInteger(id))).toBeTruthy();
  });

  test('TC-AUTHORS-GET-SCHEMA-003 no unexpected properties in items', async ({ request }) => {
    const response = await request.get(`${API_URL}/authors`, { headers });

    expect(response.status()).toBe(200);

    const body: Record<string, unknown>[] = await response.json();
    const allowed = ['id', 'firstName', 'lastName'];

    for (const item of body) {
      expect(allowed, `item ${JSON.stringify(item)}`).toEqual(expect.arrayContaining(Object.keys(item)));
    }
  });

  test('TC-AUTHORS-GET-SCHEMA-004 filtered response matches schema', async ({ request }) => {
    const response = await request.get(`${API_URL}/authors`, { headers, params: author });

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    const body = await response.json();
    const result = AuthorsSchema.safeParse(body);

    expect(result.success, result.success ? '' : result.error.message).toBeTruthy();
    expect(body.length).toBeGreaterThanOrEqual(1);
  });

  test('TC-AUTHORS-GET-SCHEMA-005 empty result is an empty array', async ({ request }) => {
    const response = await request.get(`${API_URL}/authors`, {
      headers,
      params: { lastName: uniqueName('Nomatch') },
    });

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    const body = await response.json();

    expect(Array.isArray(body)).toBeTruthy();
    expect(body).toHaveLength(0);
  });
});
