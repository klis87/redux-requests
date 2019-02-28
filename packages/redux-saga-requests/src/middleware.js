import { GET_REQUEST_CACHE, CLEAR_REQUESTS_CACHE } from './constants';
import {
  success,
  isRequestAction,
  isSuccessAction,
  isResponseAction,
  getRequestActionFromResponse,
  getActionPayload,
} from './actions';

const shouldActionBePromisified = (action, auto) =>
  (auto && !(action.meta && action.meta.asPromise === false)) ||
  (action.meta && action.meta.asPromise);

export const requestsPromiseMiddleware = ({ auto = false } = {}) => {
  const requestMap = new Map();

  return () => next => action => {
    if (isRequestAction(action) && shouldActionBePromisified(action, auto)) {
      return new Promise((resolve, reject) => {
        requestMap.set(action, (response, error) =>
          error ? reject(response) : resolve(response),
        );

        next(action);
      });
    }

    if (isResponseAction(action)) {
      const requestAction = getRequestActionFromResponse(action);

      if (shouldActionBePromisified(requestAction, auto)) {
        const requestActionPromise = requestMap.get(requestAction);
        requestActionPromise(
          action,
          action.type !== success(requestAction.type),
        );
        requestMap.delete(requestAction);
      }
    }

    return next(action);
  };
};

const isCacheValid = cache =>
  cache.expiring === null || Date.now() <= cache.expiring;

const getNewCacheTimeout = cache =>
  cache === true ? null : cache * 1000 + Date.now();

const getCacheKey = action => action.type + (action.meta.cacheKey || '');

export const requestsCacheMiddleware = () => {
  const cacheMap = new Map();

  return () => next => action => {
    if (action.type === GET_REQUEST_CACHE) {
      return cacheMap;
    }

    if (action.type === CLEAR_REQUESTS_CACHE) {
      if (action.actionTypes.length === 0) {
        cacheMap.clear();
      } else {
        action.actionTypes.forEach(actionType => cacheMap.delete(actionType));
      }

      return null;
    }

    if (isRequestAction(action) && action.meta && action.meta.cache) {
      const cacheKey = getCacheKey(action);
      const cacheValue = cacheMap.get(cacheKey);

      if (cacheValue && isCacheValid(cacheValue)) {
        return next({
          ...action,
          meta: {
            ...action.meta,
            cacheResponse: cacheValue.response,
          },
        });
      } else if (cacheValue && !isCacheValid(cacheValue)) {
        cacheMap.delete(cacheKey);
      }
    } else if (
      isSuccessAction(action) &&
      action.meta &&
      action.meta.cache &&
      !action.meta.cacheResponse
    ) {
      const requestAction = getRequestActionFromResponse(action);

      if (action.meta.cacheKey && action.meta.cacheSize) {
        const currentCacheKeys = Array.from(cacheMap.keys()).filter(k =>
          k.startsWith(requestAction.type),
        );

        if (action.meta.cacheSize === currentCacheKeys.length) {
          cacheMap.delete(currentCacheKeys[0]);
        }
      }

      cacheMap.set(getCacheKey(requestAction), {
        response: getActionPayload(action).response,
        expiring: getNewCacheTimeout(action.meta.cache),
      });
    }

    return next(action);
  };
};

export const serverRequestsFilterMiddleware = ({
  serverRequestResponseActions,
  areActionsEqual = (serverResponseAction, clientRequestAction) =>
    getRequestActionFromResponse(serverResponseAction).type ===
    clientRequestAction.type,
}) => {
  const actionsToBeIgnored = serverRequestResponseActions.slice();

  return () => next => action => {
    if (!isRequestAction(action)) {
      return next(action);
    }

    const actionToBeIgnoredIndex = actionsToBeIgnored.findIndex(a =>
      areActionsEqual(a, action),
    );

    if (actionToBeIgnoredIndex === -1) {
      return next(action);
    }

    actionsToBeIgnored.splice(actionToBeIgnoredIndex, 1);
    return null;
  };
};
