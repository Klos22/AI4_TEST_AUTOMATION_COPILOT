import { BookPayload } from '@api/models/book.model';
import {
  getRandomAvailable,
  getRandomBookTitle,
  getRandomBookYear,
  getRandomPrice,
} from '@utils/random.data.utils';

// authors must be supplied via overrides - author ids exist only at runtime
export function getRandomBookPayload(): BookPayload {
  return {
    title: getRandomBookTitle(),
    authors: [],
    year: getRandomBookYear(),
    price: getRandomPrice(),
    available: getRandomAvailable(),
  };
}

export function getRandomBookOverridePayload(overrides: Partial<BookPayload>): BookPayload {
  return {
    ...getRandomBookPayload(),
    ...overrides,
  };
}
