import {
  getActionPayload,
  createSuccessAction,
  createErrorAction,
  createAbortAction,
  setDownloadProgress,
  setUploadProgress,
} from '../actions';
import { ABORT_REQUESTS, RESET_REQUESTS, JOIN_REQUEST } from '../constants';
import { getQuery } from '../selectors';

import createRequestsStore from './create-requests-store';

const getRequestTypeString = requestType =>
  typeof requestType === 'function' ? requestType.toString() : requestType;

const getKeys = requests =>
  requests.map(v =>
    typeof v === 'object'
      ? getRequestTypeString(v.requestType) + (v.requestKey || '')
      : getRequestTypeString(v),
  );

const getDriver = (config, action) =>
  action.meta?.driver
    ? config.driver[action.meta.driver]
    : config.driver.default || config.driver;

const getLastActionKey = action =>
  action.type + (action.meta?.requestKey ? action.meta.requestKey : '');

const isActionRehydrated = action =>
  !!(
    action.meta?.cacheResponse ||
    action.meta?.ssrResponse ||
    action.meta?.ssrError
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
  action.meta?.takeLatest !== undefined
    ? action.meta.takeLatest
    : typeof config.takeLatest === 'function'
    ? config.takeLatest(action)
    : config.takeLatest;

const maybeCallOnRequestInterceptor = (action, config, store) => {
  const payload = getActionPayload(action);

  if (
    config.onRequest &&
    (!action.meta ||
      (action.meta.runOnRequest !== false && !action.meta.ssrDuplicate))
  ) {
    if (action.request) {
      return {
        ...action,
        request: config.onRequest(payload.request, action, store),
      };
    }

    return {
      ...action,
      payload: {
        ...action.payload,
        request: config.onRequest(payload.request, action, store),
      },
    };
  }

  return action;
};

const maybeCallOnRequestMeta = (action, store) => {
  const payload = getActionPayload(action);

  if (action.meta?.onRequest && !action.meta.ssrDuplicate) {
    if (action.request) {
      return {
        ...action,
        request: action.meta.onRequest(payload.request, action, store),
      };
    }

    return {
      ...action,
      payload: {
        ...action.payload,
        request: action.meta.onRequest(payload.request, action, store),
      },
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

const getDriverActions = (action, store) => {
  const driverActions = {};

  if (action.meta?.measureDownloadProgress) {
    driverActions.setDownloadProgress = progress =>
      store.dispatch(
        setDownloadProgress(
          action.type + (action.meta?.requestKey || ''),
          progress,
        ),
      );
  }

  if (action.meta?.measureUploadProgress) {
    driverActions.setUploadProgress = progress =>
      store.dispatch(
        setUploadProgress(
          action.type + (action.meta?.requestKey || ''),
          progress,
        ),
      );
  }

  return driverActions;
};

// TODO: move to helpers
const defer = () => {
  let res;
  let rej;
  const promise = new Promise((resolve, reject) => {
    res = resolve;
    rej = reject;
  });
  promise.resolve = res;
  promise.reject = rej;
  return promise;
};

const getResponsePromises = (action, config, pendingRequests, store) => {
  const actionPayload = getActionPayload(action);
  const isBatchedRequest = Array.isArray(actionPayload.request);

  if (action.meta?.cacheResponse) {
    return [Promise.resolve(action.meta.cacheResponse)];
  } else if (action.meta?.ssrResponse) {
    return [Promise.resolve(action.meta.ssrResponse)];
  } else if (action.meta?.ssrError) {
    return [Promise.reject(action.meta.ssrError)];
  }

  const driverActions = isBatchedRequest ? {} : getDriverActions(action, store);
  const driver = getDriver(config, action);
  const lastActionKey = getLastActionKey(action);
  const takeLatest = isTakeLatest(action, config);

  if (takeLatest && pendingRequests[lastActionKey]) {
    pendingRequests[lastActionKey].forEach(r => r.cancel());
  }

  const responsePromises = isBatchedRequest
    ? actionPayload.request.map(r => driver(r, action, driverActions))
    : [driver(actionPayload.request, action, driverActions)];

  if (responsePromises[0].cancel) {
    pendingRequests[lastActionKey] = responsePromises;
  }

  return responsePromises;
};

const maybeCallGetError = (action, error) => {
  if (
    error !== 'REQUEST_ABORTED' &&
    !isActionRehydrated(action) &&
    action.meta?.getError
  ) {
    throw action.meta.getError(error);
  }

  throw error;
};

const maybeCallOnErrorInterceptor = (action, config, store, error) => {
  if (
    error !== 'REQUEST_ABORTED' &&
    config.onError &&
    (!action.meta ||
      (action.meta.runOnError !== false && !action.meta.ssrDuplicate))
  ) {
    return Promise.all([config.onError(error, action, store)]);
  }

  throw error;
};

const maybeCallOnErrorMeta = (action, store, error) => {
  if (
    error !== 'REQUEST_ABORTED' &&
    action.meta?.onError &&
    !action.meta.ssrDuplicate
  ) {
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
  if (error === 'REQUEST_ABORTED' && action.meta?.onAbort) {
    action.meta.onAbort(action, store);
  }

  throw error;
};

const getInitialBatchObject = responseKeys =>
  responseKeys.reduce((prev, key) => {
    prev[key] = [];
    return prev;
  }, {});

const maybeTransformBatchRequestResponse = (action, response) => {
  const actionPayload = getActionPayload(action);
  const isBatchedRequest = Array.isArray(actionPayload.request);
  const responseKeys = Object.keys(response[0]);

  return isBatchedRequest && !isActionRehydrated(action)
    ? response.reduce((prev, current) => {
        responseKeys.forEach(key => {
          prev[key].push(current[key]);
        });
        return prev;
      }, getInitialBatchObject(responseKeys))
    : response[0];
};

const maybeCallGetData = (action, store, response) => {
  if (!isActionRehydrated(action) && action.meta?.getData) {
    const query = getQuery(store.getState(), {
      type: action.type,
      requestKey: action.meta?.requestKey,
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
    (!action.meta ||
      (action.meta.runOnSuccess !== false && !action.meta.ssrDuplicate))
  ) {
    const result = config.onSuccess(response, action, store);

    if (!isActionRehydrated(action)) {
      return result;
    }
  }

  return response;
};

const maybeCallOnSuccessMeta = (action, store, response) => {
  if (action.meta?.onSuccess && !action.meta.ssrDuplicate) {
    const result = action.meta.onSuccess(response, action, store);

    if (!isActionRehydrated(action)) {
      return result;
    }
  }

  return response;
};

const sleep = () => new Promise(resolve => setTimeout(resolve, 10));

const createSendRequestMiddleware = config => {
  // TODO: clear not pending promises sometimes
  const pendingRequests = {}; // for aborts
  const allPendingRequests = {}; // for joining

  return store => next => action => {
    const payload = getActionPayload(action);
    const requestsStore = createRequestsStore(store);

    if (action.type === JOIN_REQUEST) {
      next(action);
      return allPendingRequests[action.requestType] || sleep();
    }

    if (
      action.type === ABORT_REQUESTS ||
      (action.type === RESET_REQUESTS && payload.abortPending)
    ) {
      abortPendingRequests(action, pendingRequests);
      return next(action);
    }

    if (config.isRequestAction(action)) {
      const lastActionKey = getLastActionKey(action);
      allPendingRequests[lastActionKey] = defer();

      action = maybeCallOnRequestInterceptor(action, config, requestsStore);
      action = maybeCallOnRequestMeta(action, requestsStore);
      action = maybeDispatchRequestAction(action, next);

      const responsePromises = getResponsePromises(
        action,
        config,
        pendingRequests,
        store,
      );

      return Promise.all(responsePromises)
        .catch(error => maybeCallGetError(action, error))
        .catch(error =>
          maybeCallOnErrorInterceptor(action, config, requestsStore, error),
        )
        .catch(error => maybeCallOnErrorMeta(action, requestsStore, error))
        .catch(error =>
          maybeCallOnAbortInterceptor(action, config, requestsStore, error),
        )
        .catch(error => maybeCallOnAbortMeta(action, requestsStore, error))
        .catch(error => {
          if (error === 'REQUEST_ABORTED') {
            const abortAction = createAbortAction(action);

            if (!action.meta || !action.meta.silent) {
              store.dispatch(abortAction);
            }

            allPendingRequests[lastActionKey].resolve({
              action: abortAction,
              isAborted: true,
            });

            throw { action: abortAction, isAborted: true };
          }

          const errorAction = createErrorAction(action, error);

          if (!action.meta || !action.meta.silent) {
            store.dispatch(errorAction);
          }

          allPendingRequests[lastActionKey].resolve({
            action: errorAction,
            error,
          });

          throw { action: errorAction, error };
        })
        .then(response => {
          response = maybeTransformBatchRequestResponse(action, response);
          return maybeCallGetData(action, store, response);
        })
        .then(response =>
          maybeCallOnSuccessInterceptor(
            action,
            config,
            requestsStore,
            response,
          ),
        )
        .then(response =>
          maybeCallOnSuccessMeta(action, requestsStore, response),
        )
        .then(response => {
          const successAction = createSuccessAction(action, response);

          if (!action.meta || !action.meta.silent) {
            store.dispatch(successAction);
          }

          allPendingRequests[lastActionKey].resolve({
            action: successAction,
            ...response,
          });

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
