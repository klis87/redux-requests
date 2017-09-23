import { success, error } from 'redux-saga-requests';

import { FETCH_PHOTO, CLEAR_PHOTO, FETCH_POST, CLEAR_POST } from './constants';

const defaultPhotoState = {
  data: null,
  fetching: false,
  error: false,
};

export const photoReducer = (state = defaultPhotoState, action) => {
  switch (action.type) {
    case FETCH_PHOTO:
      return { ...defaultPhotoState, fetching: true };
    case success(FETCH_PHOTO):
      return { ...defaultPhotoState, data: action.payload.data };
    case error(FETCH_PHOTO):
      return { ...defaultPhotoState, error: true };
    case CLEAR_PHOTO:
      return defaultPhotoState;
    default:
      return state;
  }
};

const defaultPostState = {
  data: null,
  fetching: false,
  error: false,
};

export const postReducer = (state = defaultPostState, action) => {
  switch (action.type) {
    case FETCH_POST:
      return { ...defaultPostState, fetching: true };
    case success(FETCH_POST):
      return {
        ...defaultPostState,
        data: { ...action.payload.data[0], comments: action.payload.data[1] },
      };
    case error(FETCH_POST):
      return { ...defaultPostState, error: true };
    case CLEAR_POST:
      return defaultPostState;
    default:
      return state;
  }
};
