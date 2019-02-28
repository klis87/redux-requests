import { FETCH_BOOKS, FETCH_BOOKS_SCREENING_ACTORS } from './constants';

export const fetchBooks = () => ({
  type: FETCH_BOOKS,
  request: {
    url: '/api/books',
  },
  meta: {
    requestWeight: 2,
  },
});

export const fetchBooksScreeningActors = bookIds => ({
  type: FETCH_BOOKS_SCREENING_ACTORS,
  request: {
    url: '/api/bookScreeningActors',
    params: {
      bookIds,
    },
  },
  meta: {
    responseWeight: 2,
    dependentRequest: true,
  },
});
