import { requestsReducer } from 'redux-saga-requests';

import { FETCH_BOOKS, FETCH_BOOKS_SCREENING_ACTORS } from './constants';

export const booksReducer = requestsReducer({
  actionType: FETCH_BOOKS,
  multiple: true,
});

export const booksScreeningActorsReducer = requestsReducer({
  actionType: FETCH_BOOKS_SCREENING_ACTORS,
  multiple: true,
});
