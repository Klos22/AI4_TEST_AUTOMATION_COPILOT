import { AuthorResponse } from '@api/models/author.model';

export interface BookPayload {
  title: string;
  authors: number[];
  year: number;
  price: number;
  available: number;
  [key: string]: unknown;
}

export interface BookResponse {
  id: number;
  title: string;
  year: number;
  price: number;
  coverId: number | null;
  available: number;
  authors: AuthorResponse[];
  [key: string]: unknown;
}
