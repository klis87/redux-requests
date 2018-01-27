import { success, error } from 'redux-saga-requests';

import { FETCH_PHOTO, CLEAR_PHOTO, FETCH_POST, CLEAR_POST } from './constants';

const defaultState = {
  data: null,
  fetching: false,
  error: false,
};

export const photoReducer = (state = defaultState, action) => {
  switch (action.type) {
    case FETCH_PHOTO:
      return { ...defaultState, fetching: true };
    case success(FETCH_PHOTO):
      return { ...defaultState, data: action.data };
    case error(FETCH_PHOTO):
      return { ...defaultState, error: true };
    case CLEAR_PHOTO:
      return defaultState;
    default:
      return state;
  }
};

export const postReducer = (state = defaultState, action) => {
  switch (action.type) {
    case FETCH_POST:
      return { ...defaultState, fetching: true };
    case success(FETCH_POST):
      return {
        ...defaultState,
        data: { ...action.data[0], comments: action.data[1] },
      };
    case error(FETCH_POST):
      return { ...defaultState, error: true };
    case CLEAR_POST:
      return defaultState;
    default:
      return state;
  }
};
