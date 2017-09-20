import { takeLatest } from 'redux-saga/effects';
import { sendRequest } from 'redux-saga-requests';

import { fetchPosts } from './actions';

export function* postsSaga() {
  yield takeLatest(fetchPosts, sendRequest);
}
