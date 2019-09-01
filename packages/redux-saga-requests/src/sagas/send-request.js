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
