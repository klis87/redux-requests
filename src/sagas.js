import { call, put, getContext, setContext } from 'redux-saga/effects';

import { success, error } from './actions';
import { REQUEST_INSTANCE, INCORRECT_PAYLOAD_ERROR } from './constants';

export function saveRequestInstance(requestInstance) {
  return setContext({ [REQUEST_INSTANCE]: requestInstance });
}

export function getRequestInstance() {
  return getContext(REQUEST_INSTANCE);
}

export function* sendRequest(action) {
  if (!action.request) {
    throw new Error(INCORRECT_PAYLOAD_ERROR);
  }

  const requestInstance = yield call(getRequestInstance);
  yield put(action);

  try {
    const response = yield call(requestInstance, action);
    yield put({
      type: success`${action.type}`,
      payload: {
        data: response.data,
        meta: action,
      },
    });

    return response;
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
