import { call, put, all, getContext, setContext } from 'redux-saga/effects';

import { success, error } from './actions';
import { REQUEST_INSTANCE, INCORRECT_PAYLOAD_ERROR } from './constants';

export function saveRequestInstance(requestInstance) {
  return setContext({ [REQUEST_INSTANCE]: requestInstance });
}

export function getRequestInstance() {
  return getContext(REQUEST_INSTANCE);
}

export function* sendRequest(action) {
  if (!action.request && !action.requests) {
    throw new Error(INCORRECT_PAYLOAD_ERROR);
  }

  const requestInstance = yield call(getRequestInstance);
  yield put(action);
  const getApiCall = request => call(requestInstance, request);
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
      return response;
    } else {
      const responses = yield all(action.requests.map(getApiCall));
      yield put(dispatchSuccessAction(responses.map(response => response.data)));
      return responses;
    }
  } catch (e) {
    yield put({
      type: error`${action.type}`,
      payload: {
        error: e,
        meta: action,
      },
    });

    return { error: e };
  }
}
