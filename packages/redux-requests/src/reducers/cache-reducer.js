import { CLEAR_REQUESTS_CACHE } from '../constants';
import { isSuccessAction, getRequestActionFromResponse } from '../actions';

const getNewCacheTimeout = cache =>
  cache === true ? null : cache * 1000 + Date.now();

const getRequestKey = action => action.type + (action.meta.requestKey || '');

const getRequestTypeString = requestType =>
  typeof requestType === 'function' ? requestType.toString() : requestType;

const getRequestKeys = requests =>
  requests.map(v =>
    typeof v === 'object'
      ? getRequestTypeString(v.requestType) + v.requestKey
      : getRequestTypeString(v),
  );

export default (state, action) => {
  if (action.type === CLEAR_REQUESTS_CACHE) {
    if (!action.requests) {
      return {};
    }

    state = { ...state };
    getRequestKeys(action.requests).forEach(requestKey => {
      delete state[requestKey];
    });

    return state;
  }

  if (
    isSuccessAction(action) &&
    action.meta.cache &&
    !action.meta.cacheResponse &&
    !action.meta.ssrResponse
  ) {
    const requestAction = getRequestActionFromResponse(action);

    return {
      ...state,
      [getRequestKey(requestAction)]: {
        timeout: getNewCacheTimeout(action.meta.cache),
        cacheKey: action.meta.cacheKey,
      },
    };
  }

  return state;
};
