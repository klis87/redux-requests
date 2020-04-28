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

// TODO: remove to more functional style, we need object maps and filters
const createSendRequestMiddleware = config => {
  // TODO: clean not pending promises sometimes
  const pendingRequests = {};

  return store => next => action => {
    if (
      action.type === ABORT_REQUESTS ||
      (action.type === RESET_REQUESTS && action.abortPending)
    ) {
      const clearAll = !action.requests;
      const keys = !clearAll && getKeys(action.requests);

      if (!action.requests) {
        Object.values(pendingRequests).forEach(requests =>
          requests.forEach(r => r.cancel()),
        );
      } else {
        Object.entries(pendingRequests)
          .filter(([k]) => keys.includes(k))
          .forEach(([, requests]) => requests.forEach(r => r.cancel()));
      }

      return next(action);
    }

    if (config.isRequestAction(action)) {
      if (
        config.onRequest &&
        (!action.meta || action.meta.runOnRequest !== false)
      ) {
        action = {
          ...action,
          request: config.onRequest(action.request, action, store),
        };
      }

      if (action.meta && action.meta.onRequest) {
        action = {
          ...action,
          request: action.meta.onRequest(action.request, action, store),
        };
      }

      if (!action.meta || !action.meta.silent) {
        action = next(action);
      }

      let responsePromises;
      const actionPayload = getActionPayload(action);
      const isBatchedRequest = Array.isArray(actionPayload.request);

      if (action.meta && action.meta.cacheResponse) {
        responsePromises = [Promise.resolve(action.meta.cacheResponse)];
      } else if (action.meta && action.meta.ssrResponse) {
        responsePromises = [Promise.resolve(action.meta.ssrResponse)];
      } else {
        const driver = getDriver(config, action);
        const lastActionKey = getLastActionKey(action);
        const takeLatest =
          action.meta && action.meta.takeLatest !== undefined
            ? action.meta.takeLatest
            : typeof config.takeLatest === 'function'
            ? config.takeLatest(action)
            : config.takeLatest;

        if (takeLatest && pendingRequests[lastActionKey]) {
          pendingRequests[lastActionKey].forEach(r => r.cancel());
        }

        responsePromises = isBatchedRequest
          ? actionPayload.request.map(r => driver(r, action))
          : [driver(actionPayload.request, action)];

        if (responsePromises[0].cancel) {
          pendingRequests[lastActionKey] = responsePromises;
        }
      }

      return Promise.all(responsePromises)
        .catch(error => {
          if (
            error !== 'REQUEST_ABORTED' &&
            action.meta &&
            action.meta.getError
          ) {
            error = action.meta.getError(error);
          }

          if (
            error !== 'REQUEST_ABORTED' &&
            action.meta &&
            action.meta.onError
          ) {
            action.meta.onError(error, action, store);
          }

          if (
            error !== 'REQUEST_ABORTED' &&
            config.onError &&
            (!action.meta || action.meta.runOnError !== false)
          ) {
            return Promise.all([config.onError(error, action, store)]);
          }

          throw error;
        })
        .catch(error => {
          if (error === 'REQUEST_ABORTED') {
            if (
              config.onAbort &&
              (!action.meta || action.meta.runOnAbort !== false)
            ) {
              config.onAbort(action, store);
            }

            if (action.meta && action.meta.onAbort) {
              action.meta.onAbort(action, store);
            }

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
          response =
            isBatchedRequest &&
            (!action.meta ||
              (!action.meta.cacheResponse && !action.meta.ssrResponse))
              ? response.reduce(
                  (prev, current) => {
                    prev.data.push(current.data);
                    return prev;
                  },
                  { data: [] },
                )
              : response[0];

          if (
            action.meta &&
            !action.meta.cacheResponse &&
            !action.meta.ssrResponse &&
            action.meta.getData
          ) {
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
        })
        .then(response => {
          if (action.meta && action.meta.onSuccess) {
            action.meta.onSuccess(response, action, store);
          }

          if (
            config.onSuccess &&
            (!action.meta || action.meta.runOnSuccess !== false) &&
            (!action.meta ||
              (!action.meta.cacheResponse && !action.meta.ssrResponse))
          ) {
            return config.onSuccess(response, action, store);
          }

          return response;
        })
        .then(response => {
          const successAction = createSuccessAction(action, response);

          if (!action.meta || !action.meta.silent) {
            store.dispatch(successAction);
          }

          return { action: successAction, ...response };
        })
        .catch(error => error);
    }

    return next(action);
  };
};

export default createSendRequestMiddleware;
