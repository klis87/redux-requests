import { isRequestAction } from './helpers';
import { success as defaultSuccess } from './actions';

export const requestsPromiseMiddleware = ({
  success = defaultSuccess,
  getRequestAction = action =>
    action.meta && action.meta.requestAction ? action.meta.requestAction : null,
} = {}) => {
  const requestMap = new Map();

  return () => next => action => {
    if (isRequestAction(action)) {
      return new Promise((resolve, reject) => {
        requestMap.set(
          action,
          (response, error) => (error ? reject(response) : resolve(response)),
        );

        next(action);
      });
    }

    const requestAction = getRequestAction(action);

    if (requestAction) {
      const requestActionPromise = requestMap.get(requestAction);
      requestActionPromise(action, action.type !== success(requestAction.type));
      requestMap.delete(requestAction);
    }

    return next(action);
  };
};
