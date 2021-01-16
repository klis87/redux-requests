import defaultConfig from '../default-config';
import { STOP_POLLING, RESET_REQUESTS } from '../constants';

const getIntervalKey = action => action.type + (action.meta?.requestKey || '');

const getKeys = requests =>
  requests.map(v =>
    typeof v === 'object'
      ? v.requestType.toString() + (v.requestKey || '')
      : v.toString(),
  );

export default (config = defaultConfig) => {
  let intervals = {};

  return store => next => action => {
    if (action.type === STOP_POLLING || action.type === RESET_REQUESTS) {
      if (!action.requests) {
        Object.values(intervals).forEach(clearInterval);
        intervals = {};
      } else {
        const keys = getKeys(action.requests);
        const intervalsCopy = { ...intervals };

        keys.forEach(k => {
          clearInterval(intervalsCopy[k]);
          delete intervalsCopy[k];
        });

        intervals = intervalsCopy;
      }
    } else if (
      config.isRequestAction(action) &&
      config.isRequestActionQuery(action) &&
      !action.meta?.polled &&
      intervals[getIntervalKey(action)]
    ) {
      const intervalsCopy = { ...intervals };
      clearInterval(intervals[getIntervalKey(action)]);
      delete intervalsCopy[getIntervalKey(action)];
      intervals = intervalsCopy;
    }

    if (
      config.isRequestAction(action) &&
      config.isRequestActionQuery(action) &&
      action.meta?.poll &&
      !action.meta.polled
    ) {
      intervals[getIntervalKey(action)] = setInterval(() => {
        store.dispatch({ ...action, meta: { ...action.meta, polled: true } });
      }, action.meta.poll * 1000);
    }

    return next(action);
  };
};
