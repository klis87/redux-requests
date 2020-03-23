import {
  getActionPayload,
  createSuccessAction,
  createErrorAction,
} from '../actions';

const getDriver = (config, action) =>
  action.meta && action.meta.driver
    ? config.driver[action.meta.driver]
    : config.driver.default || config.driver;

const createSendRequestMiddleware = config => store => next => action => {
  const isWatchable =
    config.isRequestAction(action) &&
    (!action.meta || action.meta.runByWatcher !== false);

  if (isWatchable) {
    const driver = getDriver(config, action);
    const actionPayload = getActionPayload(action);
    const responsePromise = driver(actionPayload.request, action);

    responsePromise
      .then(response => {
        if (
          action.meta &&
          !action.meta.cacheResponse &&
          !action.meta.ssrResponse &&
          action.meta.getData
        ) {
          return { ...response, data: action.meta.getData(response.data) };
        }

        return response;
      })
      .then(response => {
        store.dispatch(createSuccessAction(action, response));
      })
      .catch(error => {
        if (action.meta && action.meta.getError) {
          throw action.meta.getError(error);
        }
        throw error;
      })
      .catch(error => {
        store.dispatch(createErrorAction(action, error));
      });
  }

  return next(action);
};

export default createSendRequestMiddleware;
