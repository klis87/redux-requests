import { takeLatest, race, call, take } from 'redux-saga/effects';
import { sendRequest } from 'redux-saga-requests';

import { fetchPhoto, fetchPost, cancelFetchPost } from './actions';

export function* photoSaga() {
  yield takeLatest(fetchPhoto, sendRequest);
}

function* fetchPostSaga(fetchPostAction) {
  yield race([call(sendRequest, fetchPostAction), take(cancelFetchPost)]);
}

export function* postSaga() {
  yield takeLatest(fetchPost, fetchPostSaga);
}
