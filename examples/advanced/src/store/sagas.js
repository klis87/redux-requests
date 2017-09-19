import { takeLatest } from 'redux-saga/effects';
import { sendRequest } from 'redux-saga-requests';

import { FETCH_POSTS } from './constants';

export function* postsSaga() {
  yield takeLatest(FETCH_POSTS, sendRequest);
}
