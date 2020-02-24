import defaultConfig from '../default-config';
import {
  success,
  isResponseAction,
  getRequestActionFromResponse,
} from '../actions';

const shouldActionBePromisified = (action, autoPromisify) =>
  (autoPromisify && !(action.meta && action.meta.asPromise === false)) ||
  (action.meta && action.meta.asPromise);

export default (config = defaultConfig) => {
  const requestMap = new Map();

  return () => next => action => {
    if (
      config.isRequestAction(action) &&
      shouldActionBePromisified(action, config.autoPromisify)
    ) {
      return new Promise((resolve, reject) => {
        requestMap.set(action, (response, error) =>
          error ? reject(response) : resolve(response),
        );

        next(action);
      });
    }

    if (isResponseAction(action)) {
      const requestAction = getRequestActionFromResponse(action);

      if (shouldActionBePromisified(requestAction, config.autoPromisify)) {
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
