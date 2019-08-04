import {
  isRequestAction,
  isResponseAction,
  getRequestActionFromResponse,
  isRequestActionQuery,
} from '../actions';
import defaultConfig from './default-config';
import requestsReducer from './requests-reducer';
import operationsReducer from './operations-reducer';

export default localConfig => {
  const config = {
    isRequestActionQuery,
    ...defaultConfig,
    ...localConfig,
    handleOperationsState: false,
  };
  let initialized = false; // for SSR hydration
  let initReducers = null;
  const requestsReducers = {};

  return (state = { queries: {}, mutations: {} }, action) => {
    if (
      !initialized &&
      Object.keys(state.queries).length > 0 &&
      Object.keys(requestsReducers).length === 0
    ) {
      initialized = true;
      const queryKeys = Object.keys(state.queries);
      initReducers = new Set(queryKeys);

      queryKeys.forEach(k => {
        requestsReducers[k] = requestsReducer({
          ...config,
          actionType: k,
        });
      });
    }

    if (
      isRequestAction(action) &&
      config.isRequestActionQuery(action) &&
      (!(action.type in requestsReducers) ||
        (initReducers && initReducers.has(action.type)))
    ) {
      requestsReducers[action.type] = requestsReducer({
        ...config,
        actionType: action.type,
        ...action.meta,
      });

      if (initReducers) {
        initReducers.delete(action.type);
      }
    }

    const queries = Object.entries(requestsReducers).reduce(
      (prev, [actionType, reducer]) => {
        prev[actionType] = reducer(state.queries[actionType], action);
        return prev;
      },
      {},
    );

    let { mutations } = state;

    if (
      (isRequestAction(action) && !config.isRequestActionQuery(action)) ||
      (isResponseAction(action) &&
        !config.isRequestActionQuery(getRequestActionFromResponse(action)))
    ) {
      mutations = operationsReducer(mutations, action, config, {
        getRequestKey:
          action.meta && action.meta.operations
            ? action.meta.operations.getRequestKey
            : null,
      });
    }

    return {
      queries,
      mutations,
    };
  };
};
