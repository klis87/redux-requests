import { GET_REQUEST_CACHE, CLEAR_REQUESTS_CACHE } from '../constants';
import {
  isRequestAction,
  isSuccessAction,
  getRequestActionFromResponse,
  getActionPayload,
} from '../actions';

const isCacheValid = cache =>
  cache.expiring === null || Date.now() <= cache.expiring;

const getNewCacheTimeout = cache =>
  cache === true ? null : cache * 1000 + Date.now();

const getCacheKey = action => action.type + (action.meta.cacheKey || '');

export default () => {
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
