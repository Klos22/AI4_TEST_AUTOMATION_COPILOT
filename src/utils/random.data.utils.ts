import { faker } from '@faker-js/faker';

// API accepts letters only in names; the random suffix guarantees uniqueness
function getRandomLettersName(base: string): string {
  const lettersOnly = base.replaceAll(/[^A-Za-z]/g, '');
  return `${lettersOnly}${faker.string.alpha({ length: 10, casing: 'lower' })}`;
}

export function getRandomLowerCaseString(length: number): string {
  return faker.string.alpha({ length, casing: 'lower' });
}

export function getRandomWord(): string {
  return faker.lorem.word();
}

export function getRandomFirstName(): string {
  return getRandomLettersName(faker.person.firstName());
}

export function getRandomLastName(): string {
  return getRandomLettersName(faker.person.lastName());
}
