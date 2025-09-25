import { RESET_REQUESTS } from '../constants';
import { mapObject } from '../helpers';

const getKeys = requests =>
  requests.map(v =>
    typeof v === 'object'
      ? v.requestType.toString() + (v.requestKey || '')
      : v.toString(),
  );

const resetQuery = query =>
  query.pending === 0
    ? undefined
    : {
        ...query,
        data: null,
        error: null,
        pristine: true,
        usedKeys: query.normalized ? {} : null,
        dependencies: query.normalized ? [] : null,
      };

const resetMutation = mutation =>
  mutation.pending === 0
    ? undefined
    : {
        ...mutation,
        error: null,
      };

// TODO: probably move a cache module
const isCacheValid = (cache, action) =>
  cache.cacheKey === action.meta?.cacheKey &&
  (cache.timeout === null || Date.now() <= cache.timeout);

export default (state, action) => {
  if (action.type !== RESET_REQUESTS) {
    return state;
  }

  let { queries, mutations, cache, downloadProgress, uploadProgress } = state;
  const clearAll = !action.requests;
  const keys = !clearAll && getKeys(action.requests);

  queries = mapObject(queries, (k, v) => {
    const cacheValue = cache[k];

    if (
      (clearAll || keys.includes(k)) &&
      (action.resetCached ||
        cacheValue === undefined ||
        (cacheValue && !isCacheValid(cacheValue, action)))
    ) {
      return resetQuery(v);
    }

    return v;
  });

  mutations = mapObject(mutations, (k, v) =>
    clearAll || keys.includes(k) ? resetMutation(v) : v,
  );

  cache =
    clearAll && action.resetCached
      ? {}
      : mapObject(cache, (k, v) => {
          const cacheValue = cache[k];

          if (
            (clearAll || keys.includes(k)) &&
            (action.resetCached ||
              cacheValue === undefined ||
              (cacheValue && !isCacheValid(cacheValue, action)))
          ) {
            return undefined;
          }

          return v;
        });

  downloadProgress = clearAll
    ? {}
    : mapObject(downloadProgress, (k, v) =>
        clearAll || keys.includes(k) ? resetMutation(v) : v,
      );

  uploadProgress = clearAll
    ? {}
    : mapObject(uploadProgress, (k, v) =>
        clearAll || keys.includes(k) ? resetMutation(v) : v,
      );

  return { queries, mutations, cache, downloadProgress, uploadProgress };
};
