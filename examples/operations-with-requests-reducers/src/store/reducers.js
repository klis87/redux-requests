import { requestsReducer } from 'redux-saga-requests';

import {
  FETCH_PHOTO,
  DELETE_PHOTO,
  DELETE_PHOTO_OPTIMISTIC,
  FETCH_POSTS,
  DELETE_POST,
  DELETE_POST_OPTIMISTIC,
} from './constants';

export const photoReducer = requestsReducer({
  actionType: FETCH_PHOTO,
  operations: {
    [DELETE_PHOTO]: () => null,
    [DELETE_PHOTO_OPTIMISTIC]: {
      updateDataOptimistic: () => null,
      revertData: (state, action) => action.meta.deletedPhoto,
    },
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
    [DELETE_POST_OPTIMISTIC]: {
      updateDataOptimistic: (state, action) =>
        state.data.filter(v => v.id !== action.meta.deletedPost.id),
      revertData: (state, action) => [action.meta.deletedPost, ...state.data],
      getRequestKey: action => String(action.meta.deletedPost.id),
    },
  },
});
