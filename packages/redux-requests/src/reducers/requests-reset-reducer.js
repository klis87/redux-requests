import { RESET_REQUESTS } from '../constants';

const getRequestTypeString = requestType =>
  typeof requestType === 'function' ? requestType.toString() : requestType;

const getKeys = requests =>
  requests.map(v =>
    typeof v === 'object'
      ? getRequestTypeString(v.requestType) + v.requestKey
      : getRequestTypeString(v),
  );

const resetQuery = query => ({
  ...query,
  data: null,
  error: null,
  pristine: true,
  usedKeys: query.normalized ? {} : null,
});

const resetMutation = mutation => ({
  ...mutation,
  error: null,
});

// TODO: probably move a cache module
const isCacheValid = (cache, action) =>
  cache.cacheKey === action.meta.cacheKey &&
  (cache.timeout === null || Date.now() <= cache.timeout);

// TODO: this should be rewritten to more functional style, we need things like filter/map object helpers
export default (state, action) => {
  if (action.type !== RESET_REQUESTS) {
    return state;
  }

  let { queries, mutations, cache, downloadProgress, uploadProgress } = state;
  const clearAll = !action.requests;
  const keys = !clearAll && getKeys(action.requests);

  queries = Object.entries(queries).reduce((prev, [k, v]) => {
    const cacheValue = cache[k];

    if (
      (clearAll || keys.includes(k)) &&
      (action.resetCached ||
        cacheValue === undefined ||
        !isCacheValid(cacheValue, action))
    ) {
      prev[k] = resetQuery(v);
    } else {
      prev[k] = v;
    }
    return prev;
  }, {});

  mutations = Object.entries(mutations).reduce((prev, [k, v]) => {
    if (clearAll || keys.includes(k)) {
      prev[k] = resetMutation(v);
    } else {
      prev[k] = v;
    }
    return prev;
  }, {});

  cache = !action.resetCached
    ? cache
    : clearAll
    ? {}
    : Object.entries(cache).reduce((prev, [k, v]) => {
        if (keys.includes(k)) {
          return prev;
        }

        prev[k] = v;

        return prev;
      }, {});

  downloadProgress = clearAll
    ? {}
    : Object.entries(downloadProgress).reduce((prev, [k, v]) => {
        if (keys.includes(k)) {
          return prev;
        }

        prev[k] = v;

        return prev;
      }, {});

  uploadProgress = clearAll
    ? {}
    : Object.entries(uploadProgress).reduce((prev, [k, v]) => {
        if (keys.includes(k)) {
          return prev;
        }

        prev[k] = v;

        return prev;
      }, {});

  return { queries, mutations, cache, downloadProgress, uploadProgress };
};
