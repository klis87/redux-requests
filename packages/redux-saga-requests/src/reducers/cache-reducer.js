import { CLEAR_REQUESTS_CACHE } from '../constants';
import { isSuccessAction, getRequestActionFromResponse } from '../actions';

const getNewCacheTimeout = cache =>
  cache === true ? null : cache * 1000 + Date.now();

const getCacheKey = action => action.type + (action.meta.requestKey || '');

export default (state, action) => {
  if (action.type === CLEAR_REQUESTS_CACHE) {
    if (action.cacheKeys.length === 0) {
      return {};
    }

    state = { ...state };
    action.cacheKeys.forEach(cacheKey => {
      delete state[cacheKey];
    });

    return state;
  }

  if (
    isSuccessAction(action) &&
    action.meta.cache &&
    !action.meta.cacheResponse
  ) {
    const requestAction = getRequestActionFromResponse(action);

    return {
      ...state,
      [getCacheKey(requestAction)]: getNewCacheTimeout(action.meta.cache),
    };
  }

  return state;
};
