import { success, error } from 'redux-saga-requests';

import { FETCH_POSTS, CLEAR_POSTS } from './constants';

const defaultState = {
  data: [],
  fetching: false,
  error: false,
};

export const postsReducer = (state = defaultState, action) => {
  switch (action.type) {
    case FETCH_POSTS:
      return { ...defaultState, fetching: true };
    case success(FETCH_POSTS):
      return { ...defaultState, data: action.payload.data };
    case error(FETCH_POSTS):
      return { ...defaultState, error: true };
    case CLEAR_POSTS:
      return defaultState;
    default:
      return state;
  }
};
