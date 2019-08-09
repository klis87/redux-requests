import {
  isRequestAction,
  isResponseAction,
  getRequestActionFromResponse,
  isRequestActionQuery,
} from '../actions';
import defaultConfig from './default-config';
import requestsReducer from './requests-reducer';
import mutationsReducer from './mutations-reducer';

export default localConfig => {
  const config = {
    isRequestActionQuery,
    ...defaultConfig,
    ...localConfig,
    handleMutationsState: false,
  };
  const requestsReducers = {};

  // for SSR hydration
  let initialized = false;
  let hydratedReducers = null;

  return (state = { queries: {}, mutations: {} }, action) => {
    if (
      !initialized &&
      Object.keys(state.queries).length > 0 &&
      Object.keys(requestsReducers).length === 0
    ) {
      initialized = true;
      const queryKeys = Object.keys(state.queries);
      hydratedReducers = new Set(queryKeys);

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
        (hydratedReducers && hydratedReducers.has(action.type)))
    ) {
      requestsReducers[action.type] = requestsReducer({
        ...config,
        actionType: action.type,
        ...action.meta,
      });

      if (hydratedReducers) {
        hydratedReducers.delete(action.type);
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
      mutations = mutationsReducer(mutations, action, config, {
        getRequestKey:
          action.meta && action.meta.mutations
            ? action.meta.mutations.getRequestKey
            : null,
      });
    }

    return {
      queries,
      mutations,
    };
  };
};
