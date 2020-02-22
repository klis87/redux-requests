import { END } from 'redux-saga';

import {
  getRequestActionFromResponse,
  isRequestAction,
  isResponseAction,
  isSuccessAction,
} from '../actions';

export default ({ requestsPromise }) => {
  let index = 0;
  const serverRequestActions = {
    requestActionsToIgnore: [],
    successActions: [],
    errorActions: [],
  };
  let active = true;

  return store => next => action => {
    if (!active) {
      return next(action);
    }

    if (isRequestAction(action)) {
      index +=
        action.meta && action.meta.dependentRequestsNumber !== undefined
          ? action.meta.dependentRequestsNumber + 1
          : 1;
    } else if (isResponseAction(action)) {
      if (!isSuccessAction(action)) {
        serverRequestActions.errorActions.push(action);
        store.dispatch(END);
        requestsPromise.reject(serverRequestActions);
        active = false;
        return next(action);
      }

      serverRequestActions.successActions.push(action);
      index -= action.meta.isDependentRequest ? 2 : 1;

      if (index === 0) {
        serverRequestActions.requestActionsToIgnore = serverRequestActions.successActions
          .map(getRequestActionFromResponse)
          .map(a => ({ type: a.type }));
        store.dispatch(END);
        requestsPromise.resolve(serverRequestActions);
        active = false;
      }
    }

    return next(action);
  };
};
