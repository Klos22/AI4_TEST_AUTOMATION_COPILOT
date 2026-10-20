export interface ExpectedBook {
  readonly searchTerm: string;
  readonly title: string;
  readonly author: string;
  readonly year: string;
  readonly price: string;
  readonly stock: number;
}

export const EFFECTIVE_JAVA: ExpectedBook = {
  searchTerm: 'effective java',
  title: 'Effective Java',
  author: 'Joshua Bloch',
  year: '2008',
  price: '$107.28',
  stock: 100,
};
