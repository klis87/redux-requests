import { requestsReducer } from 'redux-saga-requests';

import { FETCH_PHOTO, CLEAR_PHOTO, FETCH_POST, CLEAR_POST } from './constants';

export const photoReducer = requestsReducer({ actionType: FETCH_PHOTO }, (state, action) => {
  switch (action.type) {
    case CLEAR_PHOTO:
      return { ...state, data: null, error: null };
    default:
      return state;
  }
});

export const postReducer = requestsReducer(
  {
    actionType: FETCH_POST,
    getData: (state, action) => ({ ...action.payload.data[0], comments: action.payload.data[1] }),
  },
  (state, action) => {
    switch (action.type) {
      case CLEAR_POST:
        return { ...state, data: null, error: null };
      default:
        return state;
    }
  },
);
