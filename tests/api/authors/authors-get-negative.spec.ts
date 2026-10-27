import { test, expect } from '@fixtures/test.fixture';
import { faker } from '@faker-js/faker';
import { z } from 'zod';

const API_URL = 'https://bookstoreapi.up.railway.app';

const AuthorSchema = z.object({
  id: z.number().int(),
  firstName: z.string(),
  lastName: z.string(),
});
const AuthorsSchema = z.array(AuthorSchema);

// API accepts letters only in names, so uniqueness comes from a random lowercase suffix
const uniqueName = (prefix: string): string => `${prefix}${faker.string.alpha({ length: 10, casing: 'lower' })}`;

const headers = { Accept: 'application/json' };

test.describe('GET /authors - negative', () => {
  test.describe.configure({ mode: 'serial' });

  test('TC-AUTHORS-GET-NEG-001 empty string filter values', async ({ request }) => {
    const response = await request.get(`${API_URL}/authors`, {
      headers,
      params: { firstName: '', lastName: '' },
    });

    expect(response.status()).toBeLessThan(500);

    if (response.status() === 200) {
      const body = await response.json();
      expect(AuthorsSchema.safeParse(body).success).toBeTruthy();
      test.info().annotations.push({ type: 'observed', description: `200, ${body.length} authors returned` });
    }
  });

  test('TC-AUTHORS-GET-NEG-002 whitespace-only filter value', async ({ request }) => {
    const response = await request.get(`${API_URL}/authors`, {
      headers,
      params: { firstName: '   ' },
    });

    expect(response.status()).toBeLessThan(500);

    if (response.status() === 200) {
      const body = await response.json();
      expect(AuthorsSchema.safeParse(body).success).toBeTruthy();
    }
  });

  test('TC-AUTHORS-GET-NEG-003 injection-like filter value is handled safely', async ({ request }) => {
    const author = { firstName: uniqueName('Neg'), lastName: uniqueName('Inj') };
    const postResponse = await request.post(`${API_URL}/authors`, { data: author });
    expect(postResponse.status(), 'precondition: POST /authors').toBe(201);

    try {
      const response = await request.get(`${API_URL}/authors`, {
        headers,
        params: { lastName: "'; DROP TABLE authors;--" },
      });

      expect(response.status()).toBeLessThan(500);

      if (response.status() === 200) {
        expect(await response.json()).toEqual([]);
      }

      const afterResponse = await request.get(`${API_URL}/authors`, { headers, params: author });
      expect(afterResponse.status()).toBe(200);
      const after = AuthorsSchema.parse(await afterResponse.json());
      expect(after).toHaveLength(1);
    } finally {
      const lookup = await request.get(`${API_URL}/authors`, { headers, params: author });
      for (const { id } of AuthorsSchema.parse(await lookup.json())) {
        await request.delete(`${API_URL}/authors/${id}`);
      }
    }
  });

  test('TC-AUTHORS-GET-NEG-004 very long filter value', async ({ request }) => {
    const longValue = faker.string.alpha({ length: 1000, casing: 'lower' });

    const response = await request.get(`${API_URL}/authors`, {
      headers,
      params: { firstName: longValue },
    });

    expect(response.status()).toBeLessThan(500);

    if (response.status() === 200) {
      expect(await response.json()).toEqual([]);
    }
  });

  test('TC-AUTHORS-GET-NEG-005 unknown query parameter is ignored', async ({ request }) => {
    const unknownResponse = await request.get(`${API_URL}/authors`, {
      headers,
      params: { unknown: faker.lorem.word() },
    });

    expect(unknownResponse.status()).toBeLessThan(500);

    if (unknownResponse.status() === 200) {
      // Other specs create/delete authors in parallel, so compare both lists fetched together until stable
      await expect
        .poll(
          async () => {
            const withParam = await request.get(`${API_URL}/authors`, { headers, params: { unknown: 'abc' } });
            const without = await request.get(`${API_URL}/authors`, { headers });
            return JSON.stringify(await withParam.json()) === JSON.stringify(await without.json());
          },
          { timeout: 20_000 },
        )
        .toBeTruthy();
    }
  });

  test('TC-AUTHORS-GET-NEG-006 duplicated filter parameter', async ({ request }) => {
    const firstA = uniqueName('Dupa');
    const firstB = uniqueName('Dupb');

    const response = await request.get(`${API_URL}/authors?firstName=${firstA}&firstName=${firstB}`, { headers });

    expect(response.status()).toBeLessThan(500);

    if (response.status() === 200) {
      const body = await response.json();
      expect(AuthorsSchema.safeParse(body).success).toBeTruthy();
    }
  });

  test('TC-AUTHORS-GET-NEG-007 unsupported Accept header', async ({ request }) => {
    const response = await request.get(`${API_URL}/authors`, {
      headers: { Accept: 'application/xml' },
    });

    expect(response.status()).toBeLessThan(500);

    if (response.status() === 200) {
      const body = await response.json();
      expect(AuthorsSchema.safeParse(body).success).toBeTruthy();
    }
  });

  test('TC-AUTHORS-GET-NEG-008 DELETE /authors is rejected and does not delete data', async ({ request }) => {
    const author = { firstName: uniqueName('Neg'), lastName: uniqueName('Del') };
    const postResponse = await request.post(`${API_URL}/authors`, { data: author });
    expect(postResponse.status(), 'precondition: POST /authors').toBe(201);

    try {
      const response = await request.delete(`${API_URL}/authors`, { headers });

      expect(response.status()).toBeGreaterThanOrEqual(300);
      expect(response.status()).toBeLessThan(500);

      const afterResponse = await request.get(`${API_URL}/authors`, { headers, params: author });
      expect(afterResponse.status()).toBe(200);
      expect(AuthorsSchema.parse(await afterResponse.json())).toHaveLength(1);
    } finally {
      const lookup = await request.get(`${API_URL}/authors`, { headers, params: author });
      for (const { id } of AuthorsSchema.parse(await lookup.json())) {
        await request.delete(`${API_URL}/authors/${id}`);
      }
    }
  });
});
