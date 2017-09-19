import { success, error } from 'redux-saga-requests';

import { FETCH_POSTS } from './constants';

const defaultState = {
  data: [],
  fetching: false,
};

export const postsReducer = (state = defaultState, action) => {
  switch (action.type) {
    case FETCH_POSTS:
      return { ...state, fetching: true };
    case success`${FETCH_POSTS}`:
      return { data: action.payload.data, fetching: false };
    case error`${FETCH_POSTS}`:
      return defaultState;
    default:
      return state;
  }
};
