import { APIResponse } from '@playwright/test';
import { API_ENDPOINTS } from '@api/consts/api.endpoints.const';
import { BookPayload } from '@api/models/book.model';
import { APIRequest, QueryParams } from '@api/requests/api.request';

const JSON_HEADERS = { Accept: 'application/json' };

export class BooksAPIRequest {
  constructor(private readonly api: APIRequest) {}

  async createBook(payload: BookPayload): Promise<APIResponse> {
    return this.api.post(API_ENDPOINTS.books.base, payload, JSON_HEADERS);
  }

  async getBooks(params?: QueryParams): Promise<APIResponse> {
    return this.api.get(API_ENDPOINTS.books.base, params, JSON_HEADERS);
  }

  async getBookById(id: number): Promise<APIResponse> {
    return this.api.get(API_ENDPOINTS.books.byId(id), undefined, JSON_HEADERS);
  }

  async deleteBook(id: number): Promise<APIResponse> {
    return this.api.delete(API_ENDPOINTS.books.byId(id));
  }
}
