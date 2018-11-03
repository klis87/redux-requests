import { requestsReducer } from 'redux-saga-requests';

import {
  FETCH_PHOTO,
  DELETE_PHOTO,
  FETCH_POSTS,
  DELETE_POST,
} from './constants';

export const photoReducer = requestsReducer({
  actionType: FETCH_PHOTO,
  operations: {
    [DELETE_PHOTO]: () => null,
  },
});

export const postsReducer = requestsReducer({
  actionType: FETCH_POSTS,
  multiple: true,
  operations: {
    [DELETE_POST]: {
      updateData: (state, action) =>
        state.data.filter(v => v.id !== action.meta.id),
      getRequestKey: action => String(action.meta.id),
    },
  },
});
