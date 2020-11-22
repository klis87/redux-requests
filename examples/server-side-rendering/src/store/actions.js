import {
  FETCH_BOOKS,
  FETCH_BOOK,
  FETCH_BOOKS_SCREENING_ACTORS,
} from './constants';

const fetchBooksScreeningActors = bookIds => ({
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

export const fetchBooks = () => ({
  type: FETCH_BOOKS,
  request: {
    url: '/api/books',
  },
  meta: {
    dependentRequestsNumber: 1,
    onSuccess: (response, action, store) => {
      store.dispatch(fetchBooksScreeningActors(response.data.map(v => v.id)));
      return response;
    },
  },
});

export const fetchBook = id => ({
  type: FETCH_BOOK,
  request: {
    url: `/api/books/${id}`,
  },
  meta: {
    cache: true,
    requestKey: id,
    requestsCapacity: 3,
  },
});
