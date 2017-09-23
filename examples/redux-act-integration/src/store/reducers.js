import { createReducer } from 'redux-act';

import { success, error, abort, fetchPhoto, clearPhoto, fetchPost, clearPost } from './actions';

const increment = number => number + 1;

export const abortCounterReducer = createReducer({
  [abort(fetchPhoto)]: increment,
  [abort(fetchPost)]: increment,
}, 0);

const defaultPhotoState = {
  data: null,
  fetching: false,
  error: false,
};

export const photoReducer = createReducer({
  [fetchPhoto]: () => ({ ...defaultPhotoState, fetching: true }),
  [success(fetchPhoto)]: (state, payload) => ({ ...defaultPhotoState, data: payload.data }),
  [error(fetchPhoto)]: () => ({ ...defaultPhotoState, error: true }),
  [clearPhoto]: state => ({ ...state, data: null, error: false }),
}, defaultPhotoState);

const defaultPostState = {
  data: null,
  pendingRequestsCounter: 0,
  error: false,
};

export const postReducer = createReducer({
  [fetchPost]: state => ({ ...defaultPostState, pendingRequestsCounter: state.pendingRequestsCounter + 1 }),
  [success(fetchPost)]: (state, payload) => ({
    ...defaultPostState,
    data: { ...payload.data[0], comments: payload.data[1] },
    pendingRequestsCounter: state.pendingRequestsCounter - 1,
  }),
  [error(fetchPost)]: state => ({
    ...defaultPostState,
    error: true,
    pendingRequestsCounter: state.pendingRequestsCounter - 1
  }),
  [abort(fetchPost)]: state => ({ ...defaultPostState, pendingRequestsCounter: state.pendingRequestsCounter - 1 }),
  [clearPost]: state => ({ ...state, data: null, error: false }),
}, defaultPostState);
