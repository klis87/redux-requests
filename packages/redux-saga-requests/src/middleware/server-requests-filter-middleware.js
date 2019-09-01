import { isRequestAction } from '../actions';

export default ({ serverRequestActions }) => {
  const actionsToBeIgnored = serverRequestActions.slice();

  return () => next => action => {
    if (!isRequestAction(action)) {
      return next(action);
    }

    const actionToBeIgnoredIndex = actionsToBeIgnored.findIndex(
      a => a.type === action.type,
    );

    if (actionToBeIgnoredIndex === -1) {
      return next(action);
    }

    actionsToBeIgnored.splice(actionToBeIgnoredIndex, 1);
    return null;
  };
};
