import {
  call,
  takeEvery,
  put,
  all,
  cancelled,
  getContext,
  setContext,
} from 'redux-saga/effects';

import { success, error, abort } from './actions';
import {
  REQUEST_INSTANCE,
  REQUESTS_CONFIG,
  INCORRECT_PAYLOAD_ERROR,
} from './constants';

export const voidCallback = () => {};

const isFSA = action => !!action.payload;

export const successAction = (action, data) => ({
  ...(isFSA(action)
    ? {
        payload: {
          data,
        },
      }
    : {
        data,
      }),
  meta: {
    ...action.meta,
    requestAction: action,
  },
});

export const errorAction = (action, errorData) => ({
  ...(isFSA(action)
    ? {
        payload: errorData,
        error: true,
      }
    : {
        error,
      }),
  meta: {
    ...action.meta,
    requestAction: action,
  },
});

export const abortAction = action => ({
  meta: {
    ...action.meta,
    requestAction: action,
  },
});

export const defaultConfig = {
  driver: null,
  success,
  error,
  abort,
  successAction,
  errorAction,
  abortAction,
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

const getActionPayload = action =>
  action.payload === undefined ? action : action.payload;

export const isRequestAction = action => {
  const actionPayload = getActionPayload(action);
  return actionPayload.request || actionPayload.requests;
};

export const abortRequestIfDefined = abortRequest => {
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
  const requestHandlers = yield call(
    [driver, 'getRequestHandlers'],
    requestInstance,
    requestsConfig,
  );

  const actionPayload = getActionPayload(action);

  try {
    let response;
    let successPayload;

    if (actionPayload.request) {
      yield call(requestsConfig.onRequest, actionPayload.request);
      response = yield call(requestHandlers.sendRequest, actionPayload.request);
      successPayload = yield call(
        driver.getSuccessPayload,
        response,
        actionPayload.request,
      );
    } else {
      yield call(requestsConfig.onRequest, actionPayload.requests);
      response = yield all(
        actionPayload.requests.map(request =>
          call(requestHandlers.sendRequest, request),
        ),
      );
      successPayload = yield call(
        driver.getSuccessPayload,
        response,
        actionPayload.requests,
      );
    }

    yield put({
      type: requestsConfig.success(action.type),
      ...requestsConfig.successAction(action, successPayload),
    });
    yield call(requestsConfig.onSuccess, response);
    return { response };
  } catch (e) {
    const errorPayload = yield call(driver.getErrorPayload, e);
    yield put({
      type: requestsConfig.error(action.type),
      ...requestsConfig.errorAction(action, errorPayload),
    });
    yield call(requestsConfig.onError, e);
    return { error: e };
  } finally {
    if (yield cancelled()) {
      yield abortRequestIfDefined(requestHandlers.abortRequest);
      yield put({
        type: requestsConfig.abort(action.type),
        ...requestsConfig.abortAction(action),
      });
      yield call(requestsConfig.onAbort);
    }
  }
}

export function* watchRequests() {
  yield takeEvery(isRequestAction, sendRequest);
}
