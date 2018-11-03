import { requestsReducer, abort } from 'redux-saga-requests';
import { createReducer } from 'redux-act';

import {
  fetchPhotoAction,
  clearPhotoAction,
  deletePhotoAction,
  fetchPostsAction,
  clearPostsAction,
  deletePostAction,
} from './actions';

const increment = number => number + 1;

export const abortCounterReducer = createReducer(
  {
    [abort(fetchPhotoAction)]: increment,
    [abort(fetchPostsAction)]: increment,
  },
  0,
);

export const photoReducer = requestsReducer({
  actionType: fetchPhotoAction,
  resetOn: [clearPhotoAction],
  operations: {
    [deletePhotoAction]: () => null,
  },
});

export const postsReducer = requestsReducer({
  actionType: fetchPostsAction,
  resetOn: [clearPostsAction],
  multiple: true,
  operations: {
    [deletePostAction]: {
      updateData: (state, action) =>
        state.data.filter(v => v.id !== action.meta.id),
      getRequestKey: action => String(action.meta.id),
    },
  },
});
