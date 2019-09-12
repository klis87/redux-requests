import { isRequestAction } from '../actions';

const isCacheValid = cache =>
  cache.expiring === null || Date.now() <= cache.expiring;

const getCacheKey = action => action.type + (action.meta.cacheKey || '');

export default () => {
  return store => next => action => {
    if (isRequestAction(action) && action.meta && action.meta.cache) {
      const cacheKey = getCacheKey(action);
      const cacheValue = store.getState().network.cache[cacheKey];

      if (cacheValue && isCacheValid(cacheValue)) {
        return next({
          ...action,
          meta: {
            ...action.meta,
            cacheResponse: cacheValue.response,
          },
        });
      }
    }

    return next(action);
  };
};
