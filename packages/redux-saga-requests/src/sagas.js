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
  createSuccessAction,
  createErrorAction,
  createAbortAction,
} from './actions';
import { REQUESTS_CONFIG, INCORRECT_PAYLOAD_ERROR } from './constants';
import { getActionPayload, isRequestAction } from './helpers';

export const voidCallback = () => {};

export const defaultConfig = {
  driver: null,
  onRequest: null,
  onSuccess: null,
  onError: null,
  onAbort: null,
};

export function createRequestInstance(config) {
  return setContext({
    [REQUESTS_CONFIG]: { ...defaultConfig, ...config },
  });
}

export function getRequestsConfig() {
  return getContext(REQUESTS_CONFIG);
}

export function* getRequestInstance(driverType = null) {
  const config = yield getRequestsConfig();
  const driver = driverType
    ? config.driver[driverType]
    : config.driver.default || config.driver;
  return driver.requestInstance;
}

const getDriver = (requestsConfig, action) =>
  action.meta && action.meta.driver
    ? requestsConfig.driver[action.meta.driver]
    : requestsConfig.driver.default || requestsConfig.driver;

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

  const requestsConfig = yield getRequestsConfig();

  if (dispatchRequestAction && !silent) {
    yield put(action);
  }

  const driver = yield call(getDriver, requestsConfig, action);
  const actionPayload = getActionPayload(action);

  if (requestsConfig.onRequest && runOnRequest) {
    actionPayload.request = yield call(
      requestsConfig.onRequest,
      actionPayload.request,
      action,
    );
  }

  const abortSource = driver.getAbortSource();

  try {
    let response;
    let responseError;

    try {
      if (!Array.isArray(actionPayload.request)) {
        response = yield call(
          [driver, 'sendRequest'],
          actionPayload.request,
          abortSource,
          action,
        );
      } else {
        response = yield all(
          actionPayload.request.map(requestItem =>
            call([driver, 'sendRequest'], requestItem, abortSource, action),
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
          yield put(createErrorAction(action, errorPayload));
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
      actionPayload.request,
    );

    if (!silent) {
      yield put(createSuccessAction(action, successPayload));
    }

    return { response };
  } finally {
    if (yield cancelled()) {
      yield call([driver, 'abortRequest'], abortSource);

      if (requestsConfig.onAbort && runOnAbort) {
        yield call(requestsConfig.onAbort, action);
      }

      if (!silent) {
        yield put(createAbortAction(action));
      }
    }
  }
}

const isGetRequest = request =>
  !request.method || request.method.toLowerCase() === 'get';

const watchRequestsDefaultConfig = {
  takeLatest: action => {
    const { request } = getActionPayload(action);

    return Array.isArray(request)
      ? request.every(isGetRequest)
      : isGetRequest(request);
  },
  abortOn: null,
  getLastActionKey: action => action.type,
};

export function* cancelSendRequestOnAction(abortOn, task) {
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
    const takeLatest =
      typeof localConfig.takeLatest === 'function'
        ? localConfig.takeLatest(action)
        : localConfig.takeLatest;

    if (takeLatest) {
      const activeTask = lastTasks[lastActionKey];

      if (activeTask) {
        yield cancel(activeTask);
      }
    }

    const newTask = yield fork(sendRequest, action);

    if (takeLatest) {
      lastTasks[lastActionKey] = newTask;
    }

    if (localConfig.abortOn) {
      yield fork(cancelSendRequestOnAction, localConfig.abortOn, newTask);
    }
  }
}
