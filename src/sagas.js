import { call, takeEvery, put, all, cancelled, getContext, setContext } from 'redux-saga/effects';
import axios from 'axios';

import { success, error, abort } from './actions';
import { REQUEST_INSTANCE, INCORRECT_PAYLOAD_ERROR } from './constants';

export function saveRequestInstance(requestInstance) {
  return setContext({ [REQUEST_INSTANCE]: requestInstance });
}

export function getRequestInstance() {
  return getContext(REQUEST_INSTANCE);
}

export function getTokenSource() {
  return call([axios.CancelToken, 'source']);
}

export function cancelTokenSource(tokenSource) {
  return call([tokenSource, 'cancel']);
}

const getActionPayload = action => (action.payload === undefined ? action : action.payload);

export const isRequestAction = (action) => {
  const actionPayload = getActionPayload(action);
  return actionPayload.request || actionPayload.requests;
};

export function* sendRequest(action, dispatchRequestAction = false) {
  if (!isRequestAction(action)) {
    throw new Error(INCORRECT_PAYLOAD_ERROR);
  }

  const requestInstance = yield getRequestInstance();

  if (dispatchRequestAction) {
    yield put(action);
  }

  const tokenSource = yield getTokenSource();
  const getApiCall = request => call(requestInstance, { cancelToken: tokenSource.token, ...request });
  const dispatchSuccessAction = data => ({
    type: success(action.type),
    payload: {
      data,
      meta: action,
    },
  });

  const actionPayload = getActionPayload(action);

  try {
    if (actionPayload.request) {
      const response = yield getApiCall(actionPayload.request);
      yield put(dispatchSuccessAction(response.data));
      yield response;
    } else {
      const responses = yield all(actionPayload.requests.map(getApiCall));
      yield put(dispatchSuccessAction(responses.map(response => response.data)));
      yield responses;
    }
  } catch (e) {
    yield put({
      type: error(action.type),
      payload: {
        error: e,
        meta: action,
      },
    });

    yield { error: e };
  } finally {
    if (yield cancelled()) {
      yield cancelTokenSource(tokenSource);
      yield put({
        type: abort(action.type),
        payload: {
          meta: action,
        },
      });
    }
  }
}

export function* watchRequests() {
  yield takeEvery(isRequestAction, sendRequest);
}
