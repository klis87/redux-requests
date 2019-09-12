import { CLEAR_REQUESTS_CACHE } from '../constants';
import {
  isRequestAction,
  isSuccessAction,
  getRequestActionFromResponse,
} from '../actions';

const isCacheValid = cache =>
  cache.expiring === null || Date.now() <= cache.expiring;

const getNewCacheTimeout = cache =>
  cache === true ? null : cache * 1000 + Date.now();

const getCacheKey = action => action.type + (action.meta.cacheKey || '');

export default (state, action) => {
  if (action.type === CLEAR_REQUESTS_CACHE) {
    if (action.actionTypes.length === 0) {
      return {};
    }

    state = { ...state };
    action.actionTypes.forEach(actionType => {
      delete state[actionType];
    });

    return state;
  }

  if (isRequestAction(action) && action.meta && action.meta.cache) {
    const cacheKey = getCacheKey(action);
    const cacheValue = state[cacheKey];

    if (cacheValue && !isCacheValid(cacheValue)) {
      state = { ...state };
      delete state[cacheKey];
      return state;
    }
  }

  if (
    isSuccessAction(action) &&
    action.meta &&
    action.meta.cache &&
    !action.meta.cacheResponse
  ) {
    const requestAction = getRequestActionFromResponse(action);

    if (action.meta.cacheKey && action.meta.cacheSize) {
      const currentCacheKeys = Object.keys(state).filter(k =>
        k.startsWith(requestAction.type),
      );

      if (action.meta.cacheSize === currentCacheKeys.length) {
        state = { ...state };
        delete state[currentCacheKeys[0]];
      }
    }

    return {
      ...state,
      [getCacheKey(requestAction)]: {
        response: action.payload ? action.payload : action.response,
        expiring: getNewCacheTimeout(action.meta.cache),
      },
    };
  }

  return state;
};
