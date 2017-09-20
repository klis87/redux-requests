import { createReducer } from 'redux-act';

import { success, error, abort, fetchPosts, clearPosts } from './actions';

export const abortCounterReducer = createReducer({
  [abort(fetchPosts)]: state => state + 1,
}, 0);

const defaultPostsState = {
  data: [],
  fetching: false,
  error: false,
};

export const postsReducer = createReducer({
  [fetchPosts]: () => ({ ...defaultPostsState, fetching: true }),
  [success(fetchPosts)]: (state, payload) => ({ ...defaultPostsState, data: payload.data }),
  [error(fetchPosts)]: () => ({ ...defaultPostsState, error: true }),
  [clearPosts]: () => defaultPostsState,
}, defaultPostsState);
