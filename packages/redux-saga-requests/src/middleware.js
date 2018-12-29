import { CLEAR_REQUESTS_CACHE } from './constants';
import {
  success,
  isRequestAction,
  isSuccessAction,
  isResponseAction,
  getRequestActionFromResponse,
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

const isCacheValid = cache => cache === true || Date.now() <= cache;

const getNewCacheValue = cache =>
  cache === true ? cache : cache * 1000 + Date.now();

export const requestsCacheMiddleware = () => {
  const cacheMap = new Map();

  return () => next => action => {
    if (action.type === CLEAR_REQUESTS_CACHE) {
      if (action.actionTypes.length === 0) {
        cacheMap.clear();
      } else {
        action.actionTypes.forEach(actionType => cacheMap.delete(actionType));
      }

      return null;
    }

    if (
      isRequestAction(action) &&
      cacheMap.get(action.type) &&
      isCacheValid(cacheMap.get(action.type))
    ) {
      return null;
    }

    if (isSuccessAction(action) && action.meta && action.meta.cache) {
      cacheMap.set(
        getRequestActionFromResponse(action).type,
        getNewCacheValue(action.meta.cache),
      );
    }

    return next(action);
  };
};
