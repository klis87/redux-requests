import defaultConfig from '../default-config';
import { getQuery } from '../selectors';

export default (config = defaultConfig) => store => next => action => {
  if (!config.isRequestAction(action)) {
    return next(action);
  }

  const state = store.getState();
  const actionsToIgnore = state.requests.ssr;

  if (actionsToIgnore.findIndex(v => v === action.type) === -1) {
    return next(action);
  }

  const query = getQuery(state, {
    type: action.type,
    requestKey: action.meta && action.meta.requestKey,
  });

  return next({
    ...action,
    meta: {
      ...action.meta,
      ssrResponse: { data: query.data },
    },
  });
};
