import { FETCH_POSTS } from './constants';

const defaultState = {
  data: [],
  fetching: false,
};

export const postsReducer = (state = defaultState, action) => {
  switch (action.type) {
    case FETCH_POSTS:
      return state;
    default:
      return state;
  }
};
