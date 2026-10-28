import { expect } from '@playwright/test';
import { HTTP_200_OK, HTTP_201_CREATED, HTTP_204_NO_CONTENT } from '@api/consts/http.status.codes.const';
import { getRandomBookPayload } from '@api/factories/book.factory';
import { BookPayload, BookResponse } from '@api/models/book.model';
import { QueryParams } from '@api/requests/api.request';
import { BooksAPIRequest } from '@api/requests/books/books.api.request';
import { parseResponse } from '@utils/parse.response.utils';

export class BooksAPISteps {
  constructor(private readonly booksAPIRequest: BooksAPIRequest) {}

  async createBook(payload?: BookPayload): Promise<BookResponse> {
    const data = payload ?? getRandomBookPayload();
    const response = await this.booksAPIRequest.createBook(data);
    expect(response.status(), 'precondition: POST /books').toBe(HTTP_201_CREATED);
    const responseBody = await parseResponse<BookResponse>(response);
    expect(responseBody).toHaveProperty('id');
    return responseBody;
  }

  async getBooks(params?: QueryParams): Promise<BookResponse[]> {
    const response = await this.booksAPIRequest.getBooks(params);
    expect(response.status(), 'GET /books').toBe(HTTP_200_OK);
    return parseResponse<BookResponse[]>(response);
  }

  async getBookById(id: number): Promise<BookResponse> {
    const response = await this.booksAPIRequest.getBookById(id);
    expect(response.status(), 'GET /books/{id}').toBe(HTTP_200_OK);
    return parseResponse<BookResponse>(response);
  }

  async updateBook(id: number, payload: BookPayload): Promise<BookResponse> {
    const response = await this.booksAPIRequest.updateBook(id, payload);
    expect(response.status(), 'PUT /books/{id}').toBe(HTTP_200_OK);
    expect(response.headers()['content-type'], 'PUT /books/{id} content-type').toContain('application/json');
    return parseResponse<BookResponse>(response);
  }

  async deleteBook(id: number): Promise<void> {
    const response = await this.booksAPIRequest.deleteBook(id);
    expect(response.status(), 'cleanup: DELETE /books/{id}').toBe(HTTP_204_NO_CONTENT);
  }
}
