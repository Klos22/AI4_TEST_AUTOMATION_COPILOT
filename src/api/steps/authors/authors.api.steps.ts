import { expect } from '@playwright/test';
import { HTTP_200_OK, HTTP_201_CREATED, HTTP_204_NO_CONTENT } from '@api/consts/http.status.codes.const';
import { getRandomAuthorPayload } from '@api/factories/author.factory';
import { AuthorPayload, AuthorResponse } from '@api/models/author.model';
import { QueryParams } from '@api/requests/api.request';
import { AuthorsAPIRequest } from '@api/requests/authors/authors.api.request';
import { parseResponse } from '@utils/parse.response.utils';

export class AuthorsAPISteps {
  constructor(private readonly authorsAPIRequest: AuthorsAPIRequest) {}

  async createAuthor(payload?: AuthorPayload): Promise<AuthorResponse> {
    const data = payload ?? getRandomAuthorPayload();
    const response = await this.authorsAPIRequest.createAuthor(data);
    expect(response.status(), 'precondition: POST /authors').toBe(HTTP_201_CREATED);
    expect(response.headers()['content-type'], 'POST /authors content-type').toContain('application/json');
    const responseBody = await parseResponse<AuthorResponse>(response);
    expect(responseBody).toHaveProperty('id');
    return responseBody;
  }

  async getAuthors(params?: QueryParams): Promise<AuthorResponse[]> {
    const response = await this.authorsAPIRequest.getAuthors(params);
    expect(response.status(), 'GET /authors').toBe(HTTP_200_OK);
    expect(response.headers()['content-type'], 'GET /authors content-type').toContain('application/json');
    return parseResponse<AuthorResponse[]>(response);
  }

  async getAuthorById(id: number): Promise<AuthorResponse> {
    const response = await this.authorsAPIRequest.getAuthorById(id);
    expect(response.status(), 'GET /authors/{id}').toBe(HTTP_200_OK);
    expect(response.headers()['content-type'], 'GET /authors/{id} content-type').toContain('application/json');
    return parseResponse<AuthorResponse>(response);
  }

  async deleteAuthor(id: number): Promise<void> {
    const response = await this.authorsAPIRequest.deleteAuthor(id);
    expect(response.status(), 'cleanup: DELETE /authors/{id}').toBe(HTTP_204_NO_CONTENT);
  }
}
