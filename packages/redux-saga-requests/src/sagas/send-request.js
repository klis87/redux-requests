import {
  call,
  put,
  all,
  cancelled,
  getContext,
  setContext,
} from 'redux-saga/effects';

import {
  createSuccessAction,
  createErrorAction,
  createAbortAction,
  getActionPayload,
  isRequestAction,
} from '../actions';
import {
  INCORRECT_PAYLOAD_ERROR,
  RUN_BY_INTERCEPTOR,
  INTERCEPTORS,
} from '../constants';
import { getRequestsConfig } from './get-request-instance';

const getDriver = (requestsConfig, action) =>
  action.meta && action.meta.driver
    ? requestsConfig.driver[action.meta.driver]
    : requestsConfig.driver.default || requestsConfig.driver;

export default function* sendRequest(
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
    action = yield put(action); // to be affected by requestsCacheMiddleware and clientSSRMiddleware
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

  let responsePromises = [];

  try {
    let response;
    let responseError;

    try {
      if (action.meta && action.meta.cacheResponse) {
        response = action.meta.cacheResponse;
      } else if (action.meta && action.meta.ssrResponse) {
        response = action.meta.ssrResponse;
      } else if (!Array.isArray(actionPayload.request)) {
        responsePromises = [driver(actionPayload.request, action)];
        response = yield call(() => responsePromises[0]);
      } else {
        responsePromises = actionPayload.request.map(requestConfig =>
          driver(requestConfig, action),
        );
        response = yield all(
          responsePromises.map(responsePromise => call(() => responsePromise)),
        );
        response = response.reduce(
          (prev, current) => {
            prev.data.push(current.data);
            return prev;
          },
          { data: [] },
        );
      }

      if (
        action.meta &&
        !action.meta.cacheResponse &&
        !action.meta.ssrResponse &&
        action.meta.getData
      ) {
        response = { ...response, data: action.meta.getData(response.data) };
      }
    } catch (e) {
      responseError =
        action.meta && action.meta.getError ? action.meta.getError(e) : e;
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
        if (!silent) {
          yield put(createErrorAction(action, responseError));
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

    if (!silent) {
      yield put(createSuccessAction(action, response));
    }

    return { response };
  } finally {
    if (yield cancelled()) {
      responsePromises.forEach(promise => promise.cancel && promise.cancel());

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
