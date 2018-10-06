import { isRequestAction } from './helpers';
import { success } from './actions';

const shouldActionBePromisified = (action, auto) =>
  auto || (action.meta && action.meta.asPromise);

const getRequestAction = action =>
  action.meta && action.meta.requestAction ? action.meta.requestAction : null;

export const requestsPromiseMiddleware = ({ auto = false } = {}) => {
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
