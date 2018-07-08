import { isRequestAction } from './helpers';
import { success as defaultSuccess } from './actions';

const shouldActionBePromisified = (action, auto) =>
  auto || (action.meta && action.meta.asPromise);

export const requestsPromiseMiddleware = ({
  success = defaultSuccess,
  auto = false,
  getRequestAction = action =>
    action.meta && action.meta.requestAction ? action.meta.requestAction : null,
} = {}) => {
  const requestMap = new Map();

  return () => next => action => {
    if (isRequestAction(action) && shouldActionBePromisified(action, auto)) {
      return new Promise((resolve, reject) => {
        requestMap.set(
          action,
          (response, error) => (error ? reject(response) : resolve(response)),
        );

        next(action);
      });
    }

    const requestAction = getRequestAction(action);

    if (requestAction && shouldActionBePromisified(requestAction, auto)) {
      const requestActionPromise = requestMap.get(requestAction);
      requestActionPromise(action, action.type !== success(requestAction.type));
      requestMap.delete(requestAction);
    }

    return next(action);
  };
};
