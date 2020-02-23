import { END } from 'redux-saga';

import { isRequestAction, isResponseAction, isSuccessAction } from '../actions';

export default ({ requestsPromise }) => {
  let index = 0;
  const serverSuccessActions = [];

  return store => next => action => {
    if (isRequestAction(action)) {
      index +=
        action.meta && action.meta.dependentRequestsNumber !== undefined
          ? action.meta.dependentRequestsNumber + 1
          : 1;
    } else if (isResponseAction(action)) {
      if (!isSuccessAction(action)) {
        store.dispatch(END);
        requestsPromise.reject(action);
        return next(action);
      }

      serverSuccessActions.push(action);
      index -= action.meta.isDependentRequest ? 2 : 1;

      if (index === 0) {
        store.dispatch(END);
        requestsPromise.resolve(serverSuccessActions);
      }
    }

    return next(action);
  };
};
