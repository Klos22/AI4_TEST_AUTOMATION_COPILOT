import { z } from 'zod';

export const AuthorsSchema = z.array(
  z.object({
    id: z.number().int(),
    firstName: z.string(),
    lastName: z.string(),
  }),
);

export interface AuthorPayload {
  firstName: string;
  lastName: string;
  [key: string]: unknown;
}

export interface AuthorResponse {
  id: number;
  firstName: string;
  lastName: string;
  [key: string]: unknown;
}
