import { APIResponse } from '@playwright/test';
import { API_ENDPOINTS } from '@api/consts/api.endpoints.const';
import { AuthorPayload } from '@api/models/author.model';
import { APIRequest, QueryParams } from '@api/requests/api.request';

const JSON_HEADERS = { Accept: 'application/json' };

export class AuthorsAPIRequest {
  constructor(private readonly api: APIRequest) {}

  async createAuthor(payload: AuthorPayload): Promise<APIResponse> {
    return this.api.post(API_ENDPOINTS.authors.base, payload);
  }

  async getAuthors(params?: QueryParams): Promise<APIResponse> {
    return this.api.get(API_ENDPOINTS.authors.base, params, JSON_HEADERS);
  }

  async getAuthorById(id: number): Promise<APIResponse> {
    return this.api.get(API_ENDPOINTS.authors.byId(id), undefined, JSON_HEADERS);
  }

  async deleteAuthor(id: number): Promise<APIResponse> {
    return this.api.delete(API_ENDPOINTS.authors.byId(id));
  }
}
