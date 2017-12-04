import { createRequestsReducer } from 'redux-saga-requests';
import { createReducer } from 'redux-act';

import { success, error, abort, fetchPhoto, clearPhoto, fetchPost, clearPost } from './actions';

const increment = number => number + 1;

export const abortCounterReducer = createReducer({
  [abort(fetchPhoto)]: increment,
  [abort(fetchPost)]: increment,
}, 0);

const requestsReducer = createRequestsReducer({
  getSuccessSuffix: success,
  getErrorSuffix: error,
  getAbortSuffix: abort,
});

export const photoReducer = requestsReducer({ actionType: fetchPhoto.getType() }, createReducer({
  [clearPhoto]: state => ({ ...state, data: null, error: null }),
}));

export const postReducer = requestsReducer(
  {
    actionType: fetchPost.getType(),
    getData: (state, action) => ({ ...action.payload.data[0], comments: action.payload.data[1] }),
  },
  createReducer({
    [clearPost]: state => ({ ...state, data: null, error: null }),
  }),
);
