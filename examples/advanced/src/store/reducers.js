import { success, error, abort } from 'redux-saga-requests';

import { FETCH_POSTS, CLEAR_POSTS } from './constants';

const defaultState = {
  data: [],
  fetching: false,
  error: false,
  abortCounter: 0,
};

export const abortCounterReducer = (state = 0, action) => {
  switch (action.type) {
    case abort`${FETCH_POSTS}`:
      return state + 1;
    default:
      return state;
  }
};

export const postsReducer = (state = defaultState, action) => {
  switch (action.type) {
    case FETCH_POSTS:
      return { ...defaultState, fetching: true };
    case success`${FETCH_POSTS}`:
      return { ...defaultState, data: action.payload.data };
    case error`${FETCH_POSTS}`:
      return { ...defaultState, error: true };
    case CLEAR_POSTS:
      return defaultState;
    default:
      return state;
  }
};
