import { abort } from 'redux-saga-requests';

import {
  FETCH_PHOTO,
  FETCH_POST,
  INCREMENT_REQUEST_COUNTER,
  INCREMENT_RESPONSE_COUNTER,
  INCREMENT_ERROR_COUNTER,
} from './constants';

export const abortCounterReducer = (state = 0, action) => {
  switch (action.type) {
    case abort(FETCH_PHOTO):
    case abort(FETCH_POST):
      return state + 1;
    default:
      return state;
  }
};

export const requestCounterReducer = (state = 0, action) => {
  switch (action.type) {
    case INCREMENT_REQUEST_COUNTER:
      return state + 1;
    default:
      return state;
  }
};

export const responseCounterReducer = (state = 0, action) => {
  switch (action.type) {
    case INCREMENT_RESPONSE_COUNTER:
      return state + 1;
    default:
      return state;
  }
};

export const errorCounterReducer = (state = 0, action) => {
  switch (action.type) {
    case INCREMENT_ERROR_COUNTER:
      return state + 1;
    default:
      return state;
  }
};
