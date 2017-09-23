import { takeLatest } from 'redux-saga/effects';
import { sendRequest } from 'redux-saga-requests';

import { FETCH_PHOTO, FETCH_POST } from './constants';

export function* photoSaga() {
  yield takeLatest(FETCH_PHOTO, sendRequest);
}

export function* postSaga() {
  yield takeLatest(FETCH_POST, sendRequest);
}
