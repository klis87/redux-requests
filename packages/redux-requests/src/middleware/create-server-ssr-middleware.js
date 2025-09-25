import { isResponseAction, isSuccessAction, isRequestAction } from '../actions';

export default requestsPromise => {
  let index = 0;
  const successActions = [];
  const errorActions = [];

  return () => next => action => {
    if (isRequestAction(action)) {
      index +=
        action.meta.dependentRequestsNumber !== undefined
          ? action.meta.dependentRequestsNumber + 1
          : 1;
    } else if (isResponseAction(action)) {
      action = next(action);

      if (!isSuccessAction(action)) {
        errorActions.push(action);
        index -=
          action.meta.dependentRequestsNumber !== undefined
            ? action.meta.dependentRequestsNumber + 1
            : 1;
        index -= action.meta.isDependentRequest ? 1 : 0;
      } else {
        successActions.push(action);
        index -= action.meta.isDependentRequest ? 2 : 1;
      }

      if (index === 0) {
        if (errorActions.length > 0) {
          requestsPromise.reject({ successActions, errorActions });
        } else {
          requestsPromise.resolve(successActions);
        }
      }

      return action;
    }

    return next(action);
  };
};
