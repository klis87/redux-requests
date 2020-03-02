import {
  FETCH_BOOKS,
  FETCH_BOOK,
  FETCH_BOOKS_SCREENING_ACTORS,
} from './constants';

export const fetchBooks = () => ({
  type: FETCH_BOOKS,
  request: {
    url: '/api/books',
  },
  meta: {
    dependentRequestsNumber: 1,
    cache: 5,
    normalize: true,
  },
});

export const fetchBook = id => ({
  type: FETCH_BOOK,
  request: {
    url: `/api/books/${id}`,
  },
  meta: {
    cache: true,
    normalize: true,
    requestKey: id,
    requestsCapacity: 3,
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
