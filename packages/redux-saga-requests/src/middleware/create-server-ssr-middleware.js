import defaultConfig from '../default-config';
import { isResponseAction, isSuccessAction } from '../actions';

export default (requestsPromise, config = defaultConfig) => {
  let index = 0;
  const serverSuccessActions = [];

  return store => next => action => {
    if (config.isRequestAction(action)) {
      index +=
        action.meta && action.meta.dependentRequestsNumber !== undefined
          ? action.meta.dependentRequestsNumber + 1
          : 1;
    } else if (isResponseAction(action)) {
      if (!isSuccessAction(action)) {
        requestsPromise.reject(action);
        return next(action);
      }

      serverSuccessActions.push(action);
      index -= action.meta.isDependentRequest ? 2 : 1;

      if (index === 0) {
        requestsPromise.resolve(serverSuccessActions);
      }
    }

    return next(action);
  };
};
