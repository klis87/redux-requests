import { takeLatest, race, call, take, put } from 'redux-saga/effects';
import { sendRequest } from 'redux-saga-requests';

import { FETCH_PHOTO, FETCH_POST, CANCEL_FETCH_POST } from './constants';
import {
  incrementRequestCounter,
  incrementResponseCounter,
  incrementErrorCounter,
  fetchPhoto,
} from './actions';

export function* photoSaga() {
  yield takeLatest(FETCH_PHOTO, sendRequest);
}

function* fetchPost(fetchPostAction) {
  yield race([call(sendRequest, fetchPostAction), take(CANCEL_FETCH_POST)]);
}

export function* postSaga() {
  yield takeLatest(FETCH_POST, fetchPost);
}

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
      runOnError: false, // to prevent endless loop in case photo with id 1 also doesnt exist
    });
  }

  return { error };
}
