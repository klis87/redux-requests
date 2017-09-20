import { success, error, abort } from 'redux-saga-requests';

import { FETCH_POSTS, CLEAR_POSTS } from './constants';

export const abortCounterReducer = (state = 0, action) => {
  switch (action.type) {
    case abort(FETCH_POSTS):
      return state + 1;
    default:
      return state;
  }
};

const defaultPostsState = {
  data: [],
  fetching: false,
  error: false,
};

export const postsReducer = (state = defaultPostsState, action) => {
  switch (action.type) {
    case FETCH_POSTS:
      return { ...defaultPostsState, fetching: true };
    case success(FETCH_POSTS):
      return { ...defaultPostsState, data: action.payload.data };
    case error(FETCH_POSTS):
      return { ...defaultPostsState, error: true };
    case CLEAR_POSTS:
      return defaultPostsState;
    default:
      return state;
  }
};
