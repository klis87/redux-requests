import {
  getActionPayload,
  createSuccessAction,
  createErrorAction,
  createAbortAction,
} from '../actions';
import { ABORT_REQUESTS, RESET_REQUESTS } from '../constants';
import { getQuery } from '../selectors';

const getRequestTypeString = requestType =>
  typeof requestType === 'function' ? requestType.toString() : requestType;

const getKeys = requests =>
  requests.map(v =>
    typeof v === 'object'
      ? getRequestTypeString(v.requestType) + v.requestKey
      : getRequestTypeString(v),
  );

const getDriver = (config, action) =>
  action.meta && action.meta.driver
    ? config.driver[action.meta.driver]
    : config.driver.default || config.driver;

const getLastActionKey = action =>
  action.type +
  (action.meta && action.meta.requestKey ? action.meta.requestKey : '');

const isActionRehydrated = action =>
  !!(
    action.meta &&
    (action.meta.cacheResponse ||
      action.meta.ssrResponse ||
      action.meta.ssrError)
  );

// TODO: remove to more functional style, we need object maps and filters
const abortPendingRequests = (action, pendingRequests) => {
  const payload = getActionPayload(action);
  const clearAll = !payload.requests;
  const keys = !clearAll && getKeys(payload.requests);

  if (!payload.requests) {
    Object.values(pendingRequests).forEach(requests =>
      requests.forEach(r => r.cancel()),
    );
  } else {
    Object.entries(pendingRequests)
      .filter(([k]) => keys.includes(k))
      .forEach(([, requests]) => requests.forEach(r => r.cancel()));
  }
};

const isTakeLatest = (action, config) =>
  action.meta && action.meta.takeLatest !== undefined
    ? action.meta.takeLatest
    : typeof config.takeLatest === 'function'
    ? config.takeLatest(action)
    : config.takeLatest;

const maybeCallOnRequestInterceptor = (action, config, store) => {
  const payload = getActionPayload(action);

  if (
    config.onRequest &&
    (!action.meta || action.meta.runOnRequest !== false)
  ) {
    return {
      ...action,
      request: config.onRequest(payload.request, action, store),
    };
  }

  return action;
};

const maybeCallOnRequestMeta = (action, store) => {
  const payload = getActionPayload(action);

  if (action.meta && action.meta.onRequest) {
    return {
      ...action,
      request: action.meta.onRequest(payload.request, action, store),
    };
  }

  return action;
};

const maybeDispatchRequestAction = (action, next) => {
  if (!action.meta || !action.meta.silent) {
    action = next(action);
  }

  return action;
};

const getResponsePromises = (action, config, pendingRequests) => {
  const actionPayload = getActionPayload(action);
  const isBatchedRequest = Array.isArray(actionPayload.request);

  if (action.meta && action.meta.cacheResponse) {
    return [Promise.resolve(action.meta.cacheResponse)];
  } else if (action.meta && action.meta.ssrResponse) {
    return [Promise.resolve(action.meta.ssrResponse)];
  } else if (action.meta && action.meta.ssrError) {
    return [Promise.reject(action.meta.ssrError)];
  }

  const driver = getDriver(config, action);
  const lastActionKey = getLastActionKey(action);
  const takeLatest = isTakeLatest(action, config);

  if (takeLatest && pendingRequests[lastActionKey]) {
    pendingRequests[lastActionKey].forEach(r => r.cancel());
  }

  const responsePromises = isBatchedRequest
    ? actionPayload.request.map(r => driver(r, action))
    : [driver(actionPayload.request, action)];

  if (responsePromises[0].cancel) {
    pendingRequests[lastActionKey] = responsePromises;
  }

  return responsePromises;
};

const maybeCallGetError = (action, error) => {
  if (
    error !== 'REQUEST_ABORTED' &&
    !isActionRehydrated(action) &&
    action.meta &&
    action.meta.getError
  ) {
    throw action.meta.getError(error);
  }

  throw error;
};

const maybeCallOnErrorInterceptor = (action, config, store, error) => {
  if (
    error !== 'REQUEST_ABORTED' &&
    config.onError &&
    (!action.meta || action.meta.runOnError !== false)
  ) {
    return Promise.all([config.onError(error, action, store)]);
  }

  throw error;
};

const maybeCallOnErrorMeta = (action, store, error) => {
  if (error !== 'REQUEST_ABORTED' && action.meta && action.meta.onError) {
    return Promise.all([action.meta.onError(error, action, store)]);
  }

  throw error;
};

const maybeCallOnAbortInterceptor = (action, config, store, error) => {
  if (
    error === 'REQUEST_ABORTED' &&
    config.onAbort &&
    (!action.meta || action.meta.runOnAbort !== false)
  ) {
    config.onAbort(action, store);
  }

  throw error;
};

const maybeCallOnAbortMeta = (action, store, error) => {
  if (error === 'REQUEST_ABORTED' && action.meta && action.meta.onAbort) {
    action.meta.onAbort(action, store);
  }

  throw error;
};

const maybeTransformBatchRequestResponse = (action, response) => {
  const actionPayload = getActionPayload(action);
  const isBatchedRequest = Array.isArray(actionPayload.request);

  return isBatchedRequest && !isActionRehydrated(action)
    ? response.reduce(
        (prev, current) => {
          prev.data.push(current.data);
          return prev;
        },
        { data: [] },
      )
    : response[0];
};

const maybeCallGetData = (action, store, response) => {
  if (!isActionRehydrated(action) && action.meta && action.meta.getData) {
    const query = getQuery(store.getState(), {
      type: action.type,
      requestKey: action.meta && action.meta.requestKey,
    });

    return {
      ...response,
      data: action.meta.getData(response.data, query.data),
    };
  }

  return response;
};

const maybeCallOnSuccessInterceptor = (action, config, store, response) => {
  if (
    config.onSuccess &&
    (!action.meta || action.meta.runOnSuccess !== false)
  ) {
    const result = config.onSuccess(response, action, store);

    if (!isActionRehydrated(action)) {
      return result;
    }
  }

  return response;
};

const maybeCallOnSuccessMeta = (action, store, response) => {
  if (action.meta && action.meta.onSuccess) {
    const result = action.meta.onSuccess(response, action, store);

    if (!isActionRehydrated(action)) {
      return result;
    }
  }

  return response;
};

const createSendRequestMiddleware = config => {
  // TODO: clear not pending promises sometimes
  const pendingRequests = {};

  return store => next => action => {
    const payload = getActionPayload(action);

    if (
      action.type === ABORT_REQUESTS ||
      (action.type === RESET_REQUESTS && payload.abortPending)
    ) {
      abortPendingRequests(action, pendingRequests);
      return next(action);
    }

    if (config.isRequestAction(action)) {
      action = maybeCallOnRequestInterceptor(action, config, store);
      action = maybeCallOnRequestMeta(action, store);
      action = maybeDispatchRequestAction(action, next);

      const responsePromises = getResponsePromises(
        action,
        config,
        pendingRequests,
      );

      return Promise.all(responsePromises)
        .catch(error => maybeCallGetError(action, error))
        .catch(error =>
          maybeCallOnErrorInterceptor(action, config, store, error),
        )
        .catch(error => maybeCallOnErrorMeta(action, store, error))
        .catch(error =>
          maybeCallOnAbortInterceptor(action, config, store, error),
        )
        .catch(error => maybeCallOnAbortMeta(action, store, error))
        .catch(error => {
          if (error === 'REQUEST_ABORTED') {
            const abortAction = createAbortAction(action);

            if (!action.meta || !action.meta.silent) {
              store.dispatch(abortAction);
            }

            throw { action: abortAction, isAborted: true };
          }

          const errorAction = createErrorAction(action, error);

          if (!action.meta || !action.meta.silent) {
            store.dispatch(errorAction);
          }

          throw { action: errorAction, error };
        })
        .then(response => {
          response = maybeTransformBatchRequestResponse(action, response);
          return maybeCallGetData(action, store, response);
        })
        .then(response =>
          maybeCallOnSuccessInterceptor(action, config, store, response),
        )
        .then(response => maybeCallOnSuccessMeta(action, store, response))
        .then(response => {
          const successAction = createSuccessAction(action, response);

          if (!action.meta || !action.meta.silent) {
            store.dispatch(successAction);
          }

          return { action: successAction, ...response };
        })
        .catch(error => {
          if (error && error.action) {
            return error;
          }

          throw error;
        });
    }

    return next(action);
  };
};

export default createSendRequestMiddleware;
