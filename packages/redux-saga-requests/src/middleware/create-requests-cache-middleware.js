import defaultConfig from '../default-config';
import { getQuery } from '../selectors';

const isCacheValid = cache => cache === null || Date.now() <= cache;

const getCacheKey = action => action.type + (action.meta.requestKey || '');

export default (config = defaultConfig) => store => next => action => {
  if (
    config.isRequestAction(action) &&
    action.meta &&
    action.meta.cache &&
    !action.meta.ssrResponse
  ) {
    const cacheKey = getCacheKey(action);
    const state = store.getState();
    const cacheValue = state.network.cache[cacheKey];

    if (cacheValue !== undefined && isCacheValid(cacheValue)) {
      const query = getQuery(state, {
        type: action.type,
        requestKey: action.meta && action.meta.requestKey,
      });

      return next({
        ...action,
        meta: {
          ...action.meta,
          cacheResponse: { data: query.data },
        },
      });
    }
  }

  return next(action);
};
