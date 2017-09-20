import { call, takeEvery, put, all, cancelled, getContext, setContext } from 'redux-saga/effects';

import { success, error, abort } from './actions';
import { REQUEST_INSTANCE, REQUESTS_CONFIG, INCORRECT_PAYLOAD_ERROR } from './constants';
import axiosDriver from './drivers/axios-driver';

export const defaultConfig = {
  success,
  error,
  abort,
  driver: axiosDriver,
};

export function createRequestInstance(requestInstance, config = {}) {
  return setContext({
    [REQUEST_INSTANCE]: requestInstance,
    [REQUESTS_CONFIG]: { ...defaultConfig, ...config },
  });
}

export function getRequestInstance() {
  return getContext(REQUEST_INSTANCE);
}

export function getRequestsConfig() {
  return getContext(REQUESTS_CONFIG);
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
  const requestsConfig = yield getRequestsConfig();

  if (dispatchRequestAction) {
    yield put(action);
  }

  const driver = requestsConfig.driver;
  const requestHandlers = yield call([driver, 'getRequestHandlers'], requestInstance);

  const dispatchSuccessAction = response => ({
    type: requestsConfig.success(action.type),
    payload: {
      data: driver.getSuccessPayload(response),
      meta: action,
    },
  });

  const actionPayload = getActionPayload(action);

  try {
    if (actionPayload.request) {
      const response = yield requestHandlers.sendRequest(actionPayload.request);
      yield put(dispatchSuccessAction(response));
      yield response;
    } else {
      const response = yield all(actionPayload.requests.map(requestHandlers.sendRequest));
      yield put(dispatchSuccessAction(response));
      yield response;
    }
  } catch (e) {
    yield put({
      type: requestsConfig.error(action.type),
      payload: {
        error: driver.getErrorPayload(e),
        meta: action,
      },
    });

    yield { error: e };
  } finally {
    if (yield cancelled()) {
      // TODO: add test
      if (requestHandlers.abortRequest) {
        yield requestHandlers.abortRequest;
      }

      yield put({
        type: requestsConfig.abort(action.type),
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
