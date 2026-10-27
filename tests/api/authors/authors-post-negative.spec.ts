import { APIResponse } from '@playwright/test';
import { test, expect } from '@fixtures/test.fixture';
import { HTTP_201_CREATED, HTTP_400_BAD_REQUEST } from '@api/consts/http.status.codes.const';
import { getRandomAuthorOverridePayload, getRandomAuthorPayload } from '@api/factories/author.factory';
import { AuthorPayload, AuthorResponse } from '@api/models/author.model';
import { ApiErrorResponse } from '@api/models/error.model';
import { AuthorsAPIRequest } from '@api/requests/authors/authors.api.request';
import { parseResponse } from '@utils/parse.response.utils';
import { getRandomFirstName, getRandomLowerCaseString } from '@utils/random.data.utils';

type NameField = 'firstName' | 'lastName';

const OTHER_FIELD: Record<NameField, NameField> = { firstName: 'lastName', lastName: 'firstName' };
const BAD_REQUEST_ERROR = 'Bad Request';

// Builds a payload that violates the AuthorPayload type on purpose (missing fields).
function omitFields(payload: AuthorPayload, fields: NameField[]): AuthorPayload {
  const copy: Record<string, unknown> = { ...payload };
  fields.forEach((field) => delete copy[field]);
  return copy as AuthorPayload;
}

const missingFieldDatasets: {
  id: string;
  description: string;
  omit: NameField[];
  expectedMessages: string[];
  markerField?: NameField;
}[] = [
  {
    id: 'TC-AUTHORS-POST-NEGATIVE-001',
    description: 'firstName is missing',
    omit: ['firstName'],
    expectedMessages: ['firstName incorrect input data'],
    markerField: 'lastName',
  },
  {
    id: 'TC-AUTHORS-POST-NEGATIVE-002',
    description: 'lastName is missing',
    omit: ['lastName'],
    expectedMessages: ['lastName incorrect input data'],
    markerField: 'firstName',
  },
  {
    id: 'TC-AUTHORS-POST-NEGATIVE-003',
    description: 'the JSON object is empty',
    omit: ['firstName', 'lastName'],
    expectedMessages: ['firstName incorrect input data', 'lastName incorrect input data'],
  },
];

const invalidValueDatasets: { id: string; description: string; field: NameField; getValue: () => unknown }[] = [
  {
    id: 'TC-AUTHORS-POST-NEGATIVE-004',
    description: 'firstName is too short (2)',
    field: 'firstName',
    getValue: () => getRandomLowerCaseString(2),
  },
  {
    id: 'TC-AUTHORS-POST-NEGATIVE-005',
    description: 'firstName is too long (129)',
    field: 'firstName',
    getValue: () => getRandomLowerCaseString(129),
  },
  {
    id: 'TC-AUTHORS-POST-NEGATIVE-006',
    description: 'lastName is too short (2)',
    field: 'lastName',
    getValue: () => getRandomLowerCaseString(2),
  },
  {
    id: 'TC-AUTHORS-POST-NEGATIVE-007',
    description: 'lastName is too long (129)',
    field: 'lastName',
    getValue: () => getRandomLowerCaseString(129),
  },
  {
    id: 'TC-AUTHORS-POST-NEGATIVE-008',
    description: 'firstName is an empty string',
    field: 'firstName',
    getValue: () => '',
  },
  {
    id: 'TC-AUTHORS-POST-NEGATIVE-009',
    description: 'lastName is an empty string',
    field: 'lastName',
    getValue: () => '',
  },
  {
    id: 'TC-AUTHORS-POST-NEGATIVE-010',
    description: 'firstName is a number',
    field: 'firstName',
    getValue: () => 123,
  },
  {
    id: 'TC-AUTHORS-POST-NEGATIVE-011',
    description: 'firstName is null',
    field: 'firstName',
    getValue: () => null,
  },
  {
    id: 'TC-AUTHORS-POST-NEGATIVE-012',
    description: 'firstName is an object',
    field: 'firstName',
    getValue: () => ({ value: getRandomFirstName() }),
  },
];

test.describe('POST /authors 4xx', { tag: ['@api', '@authors', '@regression'] }, () => {
  const createdIds: number[] = [];

  // Safety net: removes an author if the API wrongly returns 201 for invalid data.
  test.afterEach(async ({ authorsApiSteps }) => {
    for (const id of createdIds.splice(0)) {
      await authorsApiSteps.deleteAuthor(id);
    }
  });

  async function postAuthor(authorsApiRequest: AuthorsAPIRequest, payload: AuthorPayload): Promise<APIResponse> {
    const response = await authorsApiRequest.createAuthor(payload);
    if (response.status() === HTTP_201_CREATED) {
      createdIds.push((await parseResponse<AuthorResponse>(response)).id);
    }
    return response;
  }

  missingFieldDatasets.forEach(({ id, description, omit, expectedMessages, markerField }) => {
    test(
      `should return 400 when ${description}`,
      { annotation: { type: 'scenario', description: id } },
      async ({ authorsApiRequest, authorsApiSteps }) => {
        const payload = getRandomAuthorPayload();

        const response = await postAuthor(authorsApiRequest, omitFields(payload, omit));

        expect(response.status()).toBe(HTTP_400_BAD_REQUEST);
        expect(response.headers()['content-type']).toContain('application/json');
        const body = await parseResponse<ApiErrorResponse>(response);
        expect(body.status).toBe(HTTP_400_BAD_REQUEST);
        expect(body.error).toBe(BAD_REQUEST_ERROR);
        expect(body.message).toHaveLength(expectedMessages.length);
        expect(body.message).toEqual(expect.arrayContaining(expectedMessages));

        if (markerField) {
          const authors = await authorsApiSteps.getAuthors({ [markerField]: payload[markerField] });
          expect(authors.filter((author) => author[markerField] === payload[markerField])).toHaveLength(0);
        }
      },
    );
  });

  invalidValueDatasets.forEach(({ id, description, field, getValue }) => {
    test(
      `should return 400 when ${description}`,
      { annotation: { type: 'scenario', description: id } },
      async ({ authorsApiRequest, authorsApiSteps }) => {
        // Number/null/object values deliberately violate AuthorPayload, hence the unknown cast.
        const overrides = { [field]: getValue() } as unknown as Partial<AuthorPayload>;
        const payload = getRandomAuthorOverridePayload(overrides);
        const markerField = OTHER_FIELD[field];

        const response = await postAuthor(authorsApiRequest, payload);

        expect(response.status()).toBe(HTTP_400_BAD_REQUEST);
        expect(response.headers()['content-type']).toContain('application/json');
        const body = await parseResponse<ApiErrorResponse>(response);
        expect(typeof body.timestamp).toBe('string');
        expect(body.status).toBe(HTTP_400_BAD_REQUEST);
        expect(body.error).toBe(BAD_REQUEST_ERROR);
        expect(Array.isArray(body.message)).toBe(true);

        const authors = await authorsApiSteps.getAuthors({ [markerField]: payload[markerField] });
        expect(authors.filter((author) => author[markerField] === payload[markerField])).toHaveLength(0);
      },
    );
  });
});
