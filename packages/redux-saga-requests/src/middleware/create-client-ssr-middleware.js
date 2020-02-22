import { isRequestAction } from '../actions';
import { getQuery } from '../selectors';

export default ({ serverRequestActions }) => {
  const actionsToBeIgnored = serverRequestActions.slice();

  return store => next => action => {
    const actionToBeIgnoredIndex = actionsToBeIgnored.findIndex(
      a => a.type === action.type,
    );

    if (actionToBeIgnoredIndex === -1) {
      return next(action);
    }

    if (!isRequestAction(action)) {
      return next(action);
    }

    const query = getQuery(store.getState(), {
      type: action.type,
      requestKey: action.meta && action.meta.requestKey,
    });

    actionsToBeIgnored.splice(actionToBeIgnoredIndex, 1);

    return next({
      ...action,
      meta: {
        ...action.meta,
        ssrResponse: { data: query.data },
      },
    });
  };
};
