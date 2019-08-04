import { FETCH_BOOKS, FETCH_BOOKS_SCREENING_ACTORS } from './constants';

export const fetchBooks = () => ({
  type: FETCH_BOOKS,
  request: {
    url: '/api/books',
  },
  meta: {
    dependentRequestsNumber: 1,
  },
});

export const resetBooks = () => ({
  type: 'RESET_BOOKS',
  meta: {
    operations: {
      [FETCH_BOOKS]: {
        local: true,
        updateData: () => null,
      },
    },
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
    isDependentRequest: true,
  },
});
