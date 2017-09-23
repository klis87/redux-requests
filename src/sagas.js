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

export const abortRequestIfDefined = (abortRequest) => {
  if (abortRequest) {
    return call(abortRequest);
  }

  return null;
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
  const requestHandlers = yield call([driver, 'getRequestHandlers'], requestInstance, requestsConfig);

  const dispatchSuccessAction = data => ({
    type: requestsConfig.success(action.type),
    payload: {
      data,
      meta: action,
    },
  });

  const actionPayload = getActionPayload(action);

  try {
    let response;
    let data;

    if (actionPayload.request) {
      response = yield call(requestHandlers.sendRequest, actionPayload.request);
      data = yield call(driver.getSuccessPayload, response, actionPayload.request);
    } else {
      response = yield all(actionPayload.requests.map(request => call(requestHandlers.sendRequest, request)));
      data = yield call(driver.getSuccessPayload, response, actionPayload.requests);
    }

    yield put(dispatchSuccessAction(data));
    yield response;
  } catch (e) {
    const errorPayload = yield call(driver.getErrorPayload, e);
    yield put({
      type: requestsConfig.error(action.type),
      payload: {
        error: errorPayload,
        meta: action,
      },
    });
    yield { error: e };
  } finally {
    if (yield cancelled()) {
      yield abortRequestIfDefined(requestHandlers.abortRequest);
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
