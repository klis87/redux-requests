import {
  success,
  isRequestAction,
  isResponseAction,
  getRequestActionFromResponse,
} from '../actions';

const shouldActionBePromisified = (action, auto) =>
  (auto && !(action.meta && action.meta.asPromise === false)) ||
  (action.meta && action.meta.asPromise);

export default ({ auto = false } = {}) => {
  const requestMap = new Map();

  return () => next => action => {
    if (isRequestAction(action) && shouldActionBePromisified(action, auto)) {
      return new Promise((resolve, reject) => {
        requestMap.set(action, (response, error) =>
          error ? reject(response) : resolve(response),
        );

        next(action);
      });
    }

    if (isResponseAction(action)) {
      const requestAction = getRequestActionFromResponse(action);

      if (shouldActionBePromisified(requestAction, auto)) {
        const requestActionPromise = requestMap.get(requestAction);
        requestActionPromise(
          action,
          action.type !== success(requestAction.type),
        );
        requestMap.delete(requestAction);
      }
    }

    return next(action);
  };
};
