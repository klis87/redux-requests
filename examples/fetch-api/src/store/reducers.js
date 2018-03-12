import { abort, requestsReducer } from 'redux-saga-requests';

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

export const photoReducer = requestsReducer({
  actionType: FETCH_PHOTO,
  resetOn: [CLEAR_PHOTO],
});

export const postReducer = requestsReducer({
  actionType: FETCH_POST,
  getData: (state, action) => ({
    ...action.data[0],
    comments: action.data[1],
  }),
  resetOn: [CLEAR_POST],
});
