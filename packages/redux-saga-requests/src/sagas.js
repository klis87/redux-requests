import { call, takeEvery, put, all, cancelled, getContext, setContext } from 'redux-saga/effects';

import { success, error, abort } from './actions';
import { REQUEST_INSTANCE, REQUESTS_CONFIG, INCORRECT_PAYLOAD_ERROR } from './constants';

export const voidCallback = () => {};

export const defaultConfig = {
  driver: null,
  success,
  error,
  abort,
  onRequest: voidCallback,
  onSuccess: voidCallback,
  onError: voidCallback,
  onAbort: voidCallback,
};

export function createRequestInstance(requestInstance, config) {
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

  const { driver } = requestsConfig;
  const requestHandlers = yield call([driver, 'getRequestHandlers'], requestInstance, requestsConfig);
  const fsa = !!action.payload;

  const dispatchSuccessAction = data => ({
    type: requestsConfig.success(action.type),
    ...fsa ? ({
      payload: {
        data,
      },
    }) : ({
      data,
    }),
    meta: {
      ...action.meta,
      requestAction: action,
    },
  });

  const actionPayload = getActionPayload(action);

  try {
    let response;
    let data;

    if (actionPayload.request) {
      yield call(requestsConfig.onRequest, actionPayload.request);
      response = yield call(requestHandlers.sendRequest, actionPayload.request);
      data = yield call(driver.getSuccessPayload, response, actionPayload.request);
    } else {
      yield call(requestsConfig.onRequest, actionPayload.requests);
      response = yield all(actionPayload.requests.map(request => call(requestHandlers.sendRequest, request)));
      data = yield call(driver.getSuccessPayload, response, actionPayload.requests);
    }

    yield put(dispatchSuccessAction(data));
    yield call(requestsConfig.onSuccess, response);
    return { response };
  } catch (e) {
    const errorPayload = yield call(driver.getErrorPayload, e);
    yield put({
      type: requestsConfig.error(action.type),
      ...fsa ? ({
        payload: errorPayload,
        error: true,
      }) : ({
        error: errorPayload,
      }),
      meta: {
        ...action.meta,
        requestAction: action,
      },
    });
    yield call(requestsConfig.onError, e);
    return { error: e };
  } finally {
    if (yield cancelled()) {
      yield abortRequestIfDefined(requestHandlers.abortRequest);
      yield put({
        type: requestsConfig.abort(action.type),
        meta: {
          ...action.meta,
          requestAction: action,
        },
      });
      yield call(requestsConfig.onAbort);
    }
  }
}

export function* watchRequests() {
  yield takeEvery(isRequestAction, sendRequest);
}
