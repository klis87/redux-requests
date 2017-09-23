import { success, error, abort } from 'redux-saga-requests';

import { FETCH_PHOTO, CLEAR_PHOTO, FETCH_POST, CLEAR_POST } from './constants';

export const abortCounterReducer = (state = 0, action) => {
  switch (action.type) {
    case abort(FETCH_PHOTO):
    case abort(FETCH_POST):
      return state + 1;
    default:
      return state;
  }
};

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
      return { ...state, data: null, error: false };
    default:
      return state;
  }
};

const defaultPostState = {
  data: null,
  pendingRequestsCounter: 0,
  error: false,
};

export const postReducer = (state = defaultPostState, action) => {
  switch (action.type) {
    case FETCH_POST:
      return { ...defaultPostState, pendingRequestsCounter: state.pendingRequestsCounter + 1 };
    case success(FETCH_POST):
      return {
        ...defaultPostState,
        data: { ...action.payload.data[0], comments: action.payload.data[1] },
        pendingRequestsCounter: state.pendingRequestsCounter - 1,
      };
    case error(FETCH_POST):
      return { ...defaultPostState, error: true, pendingRequestsCounter: state.pendingRequestsCounter - 1 };
    case abort(FETCH_POST):
      return { ...defaultPostState, pendingRequestsCounter: state.pendingRequestsCounter - 1 };
    case CLEAR_POST:
      return { ...state, data: null, error: false };
    default:
      return state;
  }
};
