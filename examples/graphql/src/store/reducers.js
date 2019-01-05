import { requestsReducer } from 'redux-saga-requests';

import {
  FETCH_BOOKS,
  FETCH_BOOK,
  DELETE_BOOK,
  LIKE_BOOK,
  UNLIKE_BOOK,
  UPLOAD_FILE,
  UPLOAD_FILES,
} from './constants';

export const booksReducer = requestsReducer({
  actionType: FETCH_BOOKS,
  operations: {
    [DELETE_BOOK]: {
      updateDataOptimistic: (state, action) => ({
        books: state.data.books.filter(
          v => v.id !== action.meta.deletedBook.id,
        ),
      }),
      revertData: (state, action) => ({
        books: [action.meta.deletedBook, ...state.data.books],
      }),
      getRequestKey: action => action.meta.deletedBook.id,
    },
    [LIKE_BOOK]: {
      updateData: (state, action) => ({
        books: state.data.books.map(v =>
          v.id === action.meta.id ? { ...v, liked: true } : v,
        ),
      }),
      getRequestKey: action => action.meta.id,
    },
    [UNLIKE_BOOK]: {
      updateData: (state, action) => ({
        books: state.data.books.map(v =>
          v.id === action.meta.id ? { ...v, liked: false } : v,
        ),
      }),
      getRequestKey: action => action.meta.id,
    },
  },
});

export const bookReducer = requestsReducer({
  actionType: FETCH_BOOK,
});

export const fileReducer = requestsReducer({
  actionType: UPLOAD_FILE,
});

export const filesReducer = requestsReducer({
  actionType: UPLOAD_FILES,
});
