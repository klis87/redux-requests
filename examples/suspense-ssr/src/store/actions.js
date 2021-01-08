import { FETCH_BOOKS, FETCH_BOOKS_SCREENING_ACTORS } from './constants';

export const fetchBooks = () => ({
  type: FETCH_BOOKS,
  request: {
    url: '/api/books',
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
});
