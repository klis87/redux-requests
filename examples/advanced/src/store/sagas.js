import { put } from 'redux-saga/effects';
import { sendRequest } from 'redux-saga-requests';

import { FETCH_PHOTO } from './constants';
import {
  incrementRequestCounter,
  incrementResponseCounter,
  incrementErrorCounter,
  fetchPhoto,
} from './actions';

export function* requestCounterSaga(request) {
  yield put(incrementRequestCounter());
  return request;
}

export function* responseCounterSaga(response) {
  yield put(incrementResponseCounter());
  return response;
}

export function* errorCounterSaga(error, action) {
  yield put(incrementErrorCounter());

  if (
    error.response &&
    error.response.status === 404 &&
    action.type === FETCH_PHOTO
  ) {
    return yield sendRequest(fetchPhoto(1), {
      silent: true,
      runOnSuccess: false, // to prevent duplicated incrementResponseCounter
      runOnError: false, // to prevent endless loop in case photo with id 1 also doesnt exist
    });
  }

  return { error };
}
