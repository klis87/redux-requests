import { call, takeEvery, put, all, cancelled, getContext, setContext } from 'redux-saga/effects';

import { success, error, abort } from './actions';
import { REQUEST_INSTANCE, INCORRECT_PAYLOAD_ERROR } from './constants';

export function saveRequestInstance(requestInstance) {
  return setContext({ [REQUEST_INSTANCE]: requestInstance });
}

export function getRequestInstance() {
  return getContext(REQUEST_INSTANCE);
}

export function getTokenSource(requestInstance) {
  return call([requestInstance.CancelToken, 'source']);
}

export function cancelTokenSource(tokenSource) {
  return call([tokenSource, 'cancel']);
}

export const isRequestAction = action => action.request || action.requests;

export function* sendRequest(action, dispatchRequestAction = false) {
  if (!isRequestAction(action)) {
    throw new Error(INCORRECT_PAYLOAD_ERROR);
  }

  const requestInstance = yield getRequestInstance();

  if (dispatchRequestAction) {
    yield put(action);
  }

  const tokenSource = yield getTokenSource(requestInstance);
  const getApiCall = request => call(requestInstance, { cancelToken: tokenSource.token, ...request });
  const dispatchSuccessAction = data => ({
    type: success`${action.type}`,
    payload: {
      data,
      meta: action,
    },
  });

  try {
    if (action.request) {
      const response = yield getApiCall(action.request);
      yield put(dispatchSuccessAction(response.data));
      yield response;
    } else {
      const responses = yield all(action.requests.map(getApiCall));
      yield put(dispatchSuccessAction(responses.map(response => response.data)));
      yield responses;
    }
  } catch (e) {
    yield put({
      type: error`${action.type}`,
      payload: {
        error: e,
        meta: action,
      },
    });

    yield { error: e };
  } finally {
    if (yield cancelled()) {
      yield cancelTokenSource(tokenSource);
      yield put({ type: abort`${action.type}` });
    }
  }
}

export function* watchRequests() {
  yield takeEvery(isRequestAction, sendRequest);
}
