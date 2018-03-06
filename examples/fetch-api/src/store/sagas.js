import { takeLatest, race, call, take } from 'redux-saga/effects';
import { sendRequest } from 'redux-saga-requests';

import { FETCH_PHOTO, FETCH_POST, CANCEL_FETCH_POST } from './constants';

export function* photoSaga() {
  yield takeLatest(FETCH_PHOTO, sendRequest);
}

function* fetchPost(fetchPostAction) {
  yield race([call(sendRequest, fetchPostAction), take(CANCEL_FETCH_POST)]);
}

export function* postSaga() {
  yield takeLatest(FETCH_POST, fetchPost);
}
