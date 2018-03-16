import { isRequestAction } from './helpers';
import { success } from './actions';

export const requestsPromiseMiddleware = () => {
  const requestMap = new Map();

  return next => action => {
    if (isRequestAction(action)) {
      return new Promise((resolve, reject) => {
        requestMap.set(
          action,
          (response, error) => (error ? reject(response) : resolve(response)),
        );

        next(action);
      });
    }

    if (action.meta && action.meta.requestAction) {
      const { requestAction } = action.meta;
      const requestActionPromise = requestMap.get(requestAction);
      requestActionPromise(action, action.type !== success(requestAction.type));
      requestMap.delete(requestAction);
    }

    return next(action);
  };
};
