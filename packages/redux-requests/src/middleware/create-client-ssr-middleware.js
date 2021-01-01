import defaultConfig from '../default-config';
import { getQuery } from '../selectors';

export default (config = defaultConfig) => store => next => action => {
  if (!config.isRequestAction(action)) {
    return next(action);
  }

  const state = store.getState();
  const actionsToIgnore = state.requests.ssr;
  const actionToIgnore = actionsToIgnore.find(
    v => (v.requestType || v) === action.type + (action.meta?.requestKey || ''),
  );

  if (!actionToIgnore) {
    return next(action);
  }

  const query = getQuery(state, {
    type: action.type,
    requestKey: action.meta?.requestKey,
  });

  action.meta = actionToIgnore.duplicate
    ? { ...action.meta, ssrDuplicate: true }
    : action.meta;

  if (query.error) {
    return next({
      ...action,
      meta: {
        ...action.meta,
        ssrError: query.error,
      },
    });
  }

  return next({
    ...action,
    meta: {
      ...action.meta,
      ssrResponse: { data: query.data },
    },
  });
};
