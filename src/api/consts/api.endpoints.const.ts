export const API_BASE_URL = process.env.API_URL ?? 'http://localhost:3000';

export const API_ENDPOINTS = {
  authors: {
    base: '/authors',
    byId: (id: number): string => `/authors/${id}`,
  },
  books: {
    base: '/books',
    byId: (id: number): string => `/books/${id}`,
  },
};
