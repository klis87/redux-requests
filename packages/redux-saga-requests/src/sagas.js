import {
  call,
  fork,
  join,
  take,
  race,
  cancel,
  put,
  all,
  cancelled,
  getContext,
  setContext,
} from 'redux-saga/effects';
import { delay } from 'redux-saga';

import {
  success,
  error,
  abort,
  successAction,
  errorAction,
  abortAction,
} from './actions';
import {
  REQUEST_INSTANCE,
  REQUESTS_CONFIG,
  INCORRECT_PAYLOAD_ERROR,
} from './constants';

export const voidCallback = () => {};

export const defaultConfig = {
  driver: null,
  success,
  error,
  abort,
  successAction,
  errorAction,
  abortAction,
  onRequest: null,
  onSuccess: null,
  onError: null,
  onAbort: null,
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

export function* sendRequest(
  action,
  {
    dispatchRequestAction = false,
    silent = false,
    runOnRequest = true,
    runOnSuccess = true,
    runOnError = true,
    runOnAbort = true,
  } = {},
) {
  if (!isRequestAction(action)) {
    throw new Error(INCORRECT_PAYLOAD_ERROR);
  }

  const requestInstance = yield getRequestInstance();
  const requestsConfig = yield getRequestsConfig();

  if (dispatchRequestAction && !silent) {
    yield put(action);
  }

  const { driver } = requestsConfig;

  const requestHandlers = yield call(
    [driver, 'getRequestHandlers'],
    requestInstance,
    requestsConfig,
  );

  const actionPayload = getActionPayload(action);

  let request = actionPayload.request || actionPayload.requests;

  if (requestsConfig.onRequest && runOnRequest) {
    request = yield call(requestsConfig.onRequest, request, action);
  }

  try {
    let response;
    let responseError;

    try {
      if (actionPayload.request) {
        response = yield call(requestHandlers.sendRequest, request);
      } else {
        response = yield all(
          request.map(requestItem =>
            call(requestHandlers.sendRequest, requestItem),
          ),
        );
      }
    } catch (e) {
      responseError = e;
    }

    if (responseError) {
      if (requestsConfig.onError && runOnError) {
        const { response: onErrorResponse, error: onErrorError } = yield call(
          requestsConfig.onError,
          responseError,
          action,
        );

        if (onErrorResponse) {
          response = onErrorResponse;
        } else {
          responseError = onErrorError;
        }
      }

      if (!response) {
        const errorPayload = yield call(driver.getErrorPayload, responseError);

        if (!silent) {
          yield put({
            type: requestsConfig.error(action.type),
            ...requestsConfig.errorAction(action, errorPayload),
          });
        }

        return { error: responseError };
      }
    }

    if (requestsConfig.onSuccess && runOnSuccess) {
      response = yield call(requestsConfig.onSuccess, response, action);
    }

    const successPayload = yield call(
      driver.getSuccessPayload,
      response,
      request,
    );

    if (!silent) {
      yield put({
        type: requestsConfig.success(action.type),
        ...requestsConfig.successAction(action, successPayload),
      });
    }

    return { response };
  } finally {
    if (yield cancelled()) {
      yield abortRequestIfDefined(requestHandlers.abortRequest);

      if (requestsConfig.onAbort && runOnAbort) {
        yield call(requestsConfig.onAbort, action);
      }

      if (!silent) {
        yield put({
          type: requestsConfig.abort(action.type),
          ...requestsConfig.abortAction(action),
        });
      }
    }
  }
}

const watchRequestsDefaultConfig = {
  takeLatest: true,
  abortOn: null,
  getLastActionKey: action => action.type,
};

function* cancelSendRequestOnAction(abortOn, task) {
  const { abortingAction } = yield race({
    abortingAction: take(abortOn),
    taskFinished: join(task),
    timeout: call(delay, 10000), // taskFinished doesnt work for aborted tasks
  });

  if (abortingAction) {
    yield cancel(task);
  }
}

export function* watchRequests(common = {}, perRequestType = {}) {
  const lastTasks = {};
  const config = { ...watchRequestsDefaultConfig, ...common };

  while (true) {
    const action = yield take(isRequestAction);
    const localConfig = perRequestType[action.type]
      ? { ...config, ...perRequestType[action.type] }
      : config;

    const lastActionKey = localConfig.getLastActionKey(action);

    if (localConfig.takeLatest) {
      const activeTask = lastTasks[lastActionKey];

      if (activeTask) {
        yield cancel(activeTask);
      }
    }

    const newTask = yield fork(sendRequest, action);

    if (localConfig.takeLatest) {
      lastTasks[lastActionKey] = newTask;
    }

    if (localConfig.abortOn) {
      yield fork(cancelSendRequestOnAction, localConfig.abortOn, newTask);
    }
  }
}
