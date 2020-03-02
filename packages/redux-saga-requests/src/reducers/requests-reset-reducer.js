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
  usedKeys: query.normalized ? {} : null,
});

const resetMutation = mutation => ({
  ...mutation,
  error: null,
});

// TODO: this should be rewritten to more functional style, we need things like filter/map object helpers
export default (state, action) => {
  if (action.type !== RESET_REQUESTS) {
    return state;
  }

  let { queries, mutations, cache } = state;
  const clearAll = !action.requests;
  const keys = !clearAll && getKeys(action.requests);

  queries = Object.entries(queries).reduce((prev, [k, v]) => {
    if (clearAll || keys.includes(k)) {
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

  cache = clearAll
    ? {}
    : Object.entries(cache).reduce((prev, [k, v]) => {
        if (keys.includes(k)) {
          return prev;
        }

        prev[k] = v;

        return prev;
      }, {});

  return { queries, mutations, cache };
};
