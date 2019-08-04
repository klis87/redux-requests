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
import { END } from 'redux-saga';

import {
  createSuccessAction,
  createErrorAction,
  createAbortAction,
  getActionPayload,
  getRequestActionFromResponse,
  isRequestAction,
  isResponseAction,
  isSuccessAction,
  isRequestActionQuery,
} from './actions';
import {
  REQUESTS_CONFIG,
  INCORRECT_PAYLOAD_ERROR,
  RUN_BY_INTERCEPTOR,
  INTERCEPTORS,
} from './constants';

/* eslint-disable */
const delay =
  require('redux-saga').delay || require('@redux-saga/delay-p').default;
/* eslint-enable */

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
    runOnRequest = null,
    runOnSuccess = null,
    runOnError = null,
    runOnAbort = null,
  } = {},
) {
  if (!isRequestAction(action)) {
    throw new Error(INCORRECT_PAYLOAD_ERROR);
  }
  const runByInterceptor = yield getContext(RUN_BY_INTERCEPTOR);
  const requestsConfig = yield getRequestsConfig();

  if (dispatchRequestAction && !silent) {
    action = { ...action, meta: { ...action.meta, runByWatcher: false } };
    action = yield put(action); // to be affected by requestsCacheMiddleware and serverRequestsFilterMiddleware

    // only possible when using  serverRequestsFilterMiddleware
    if (action === null) {
      return { serverSide: true };
    }
  }

  const driver = yield call(getDriver, requestsConfig, action);
  const actionPayload = getActionPayload(action);

  if (
    requestsConfig.onRequest &&
    (runOnRequest !== null
      ? runOnRequest
      : runByInterceptor !== INTERCEPTORS.ON_REQUEST)
  ) {
    yield setContext({ [RUN_BY_INTERCEPTOR]: INTERCEPTORS.ON_REQUEST });

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
      if (action.meta && action.meta.cacheResponse) {
        response = action.meta.cacheResponse;
      } else if (!Array.isArray(actionPayload.request)) {
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
      if (
        requestsConfig.onError &&
        (runOnError !== null
          ? runOnError
          : runByInterceptor !== INTERCEPTORS.ON_ERROR)
      ) {
        yield setContext({ [RUN_BY_INTERCEPTOR]: INTERCEPTORS.ON_ERROR });

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

    if (
      requestsConfig.onSuccess &&
      (runOnSuccess !== null
        ? runOnSuccess
        : runByInterceptor !== INTERCEPTORS.ON_SUCCESS &&
          runByInterceptor !== INTERCEPTORS.ON_ERROR)
    ) {
      yield setContext({ [RUN_BY_INTERCEPTOR]: INTERCEPTORS.ON_SUCCESS });
      response = yield call(requestsConfig.onSuccess, response, action);
    }

    const successPayload = yield call(
      driver.getSuccessPayload,
      response,
      actionPayload.request,
    );

    if (!silent) {
      yield put(createSuccessAction(action, successPayload, response));
    }

    return { response };
  } finally {
    if (yield cancelled()) {
      yield call([driver, 'abortRequest'], abortSource);

      if (
        requestsConfig.onAbort &&
        (runOnAbort !== null
          ? runOnAbort
          : runByInterceptor !== INTERCEPTORS.ON_ABORT)
      ) {
        yield setContext({ [RUN_BY_INTERCEPTOR]: INTERCEPTORS.ON_ABORT });
        yield call(requestsConfig.onAbort, action);
      }

      if (!silent) {
        yield put(createAbortAction(action));
      }
    }
  }
}

const watchRequestsDefaultConfig = {
  takeLatest: isRequestActionQuery,
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

const isWatchable = a =>
  isRequestAction(a) && (!a.meta || a.meta.runByWatcher !== false);

export function* watchRequests(commonConfig = {}) {
  const lastTasks = {};
  const config = { ...watchRequestsDefaultConfig, ...commonConfig };

  while (true) {
    const action = yield take(isWatchable);
    const lastActionKey = config.getLastActionKey(action);
    const takeLatest =
      action.meta && action.meta.takeLatest !== undefined
        ? action.meta.takeLatest
        : typeof config.takeLatest === 'function'
        ? config.takeLatest(action)
        : config.takeLatest;

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

    const abortOn =
      action.meta && action.meta.abortOn ? action.meta.abortOn : config.abortOn;

    if (abortOn) {
      yield fork(cancelSendRequestOnAction, abortOn, newTask);
    }
  }
}

export function* countServerRequests({
  serverRequestActions,
  finishOnFirstError = true,
}) {
  let index = 0;
  serverRequestActions.requestActionsToIgnore = [];
  serverRequestActions.successActions = [];
  serverRequestActions.dependentSuccessActions = [];
  serverRequestActions.errorActions = [];

  while (true) {
    const action = yield take(a => isRequestAction(a) || isResponseAction(a));

    if (isRequestAction(action)) {
      index +=
        action.meta && action.meta.dependentRequestsNumber !== undefined
          ? action.meta.dependentRequestsNumber + 1
          : 1;
      continue;
    }

    if (!isSuccessAction(action)) {
      serverRequestActions.errorActions.push(action);

      if (finishOnFirstError) {
        yield put(END);
        return;
      }
    } else if (action.meta.isDependentRequest) {
      serverRequestActions.dependentSuccessActions.push(action);
    } else {
      serverRequestActions.successActions.push(action);
    }

    index -= action.meta.isDependentRequest ? 2 : 1;

    if (index === 0) {
      serverRequestActions.requestActionsToIgnore = serverRequestActions.successActions
        .map(getRequestActionFromResponse)
        .map(a => ({ type: a.type }));
      yield put(END);
      return;
    }
  }
}
