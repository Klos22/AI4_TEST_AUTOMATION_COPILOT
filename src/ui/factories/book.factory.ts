import { faker } from '@faker-js/faker';
import { BookFormData } from '@ui/models/book.model';

export function createBookFormData(): BookFormData {
  return {
    title: faker.book.title(),
    year: faker.number.int({ min: 1990, max: 2026 }),
    price: faker.number.int({ min: 10, max: 100 }),
    quantity: faker.number.int({ min: 1, max: 50 }),
  };
}
