import { getQuery } from '../selectors';
import { isRequestAction } from '../actions';

const isCacheValid = (cache, action) =>
  cache.cacheKey === action.meta.cacheKey &&
  (cache.timeout === null || Date.now() <= cache.timeout);

const getKey = action => action.type + (action.meta.requestKey || '');

export default () => store => next => action => {
  if (
    isRequestAction(action) &&
    action.meta.cache &&
    !action.meta.ssrResponse
  ) {
    const key = getKey(action);
    const state = store.getState();
    const cacheValue = state.requests.cache[key];

    if (cacheValue !== undefined && isCacheValid(cacheValue, action)) {
      const query = getQuery(state, {
        type: action.type,
        requestKey: action.meta.requestKey,
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
