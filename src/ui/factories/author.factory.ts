import { faker } from '@faker-js/faker';
import { AuthorFormData } from '@ui/models/author.model';

export function createAuthorFormData(): AuthorFormData {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName().replace(/['\s]/g, '');

  return {
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    initials: `${firstName[0]}${lastName[0]}`.toUpperCase(),
  };
}
