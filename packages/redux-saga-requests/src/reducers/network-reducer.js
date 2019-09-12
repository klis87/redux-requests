import {
  isRequestAction,
  isResponseAction,
  getRequestActionFromResponse,
} from '../actions';
import defaultConfig from './default-config';
import requestsReducer from './requests-reducer';
import mutationsReducer from './mutations-reducer';
import cacheReducer from './cache-reducer';

export default localConfig => {
  const config = { ...defaultConfig, ...localConfig };

  return (state = { queries: {}, mutations: {}, cache: {} }, action) => {
    const queries = Object.entries(state.queries).reduce(
      (prev, [actionType, query]) => {
        prev[actionType] = requestsReducer(query, action, actionType);
        return prev;
      },
      isRequestAction(action) &&
        config.isRequestActionQuery(action) &&
        !(action.type in Object.keys(state.queries))
        ? {
            [action.type]: requestsReducer(undefined, action, action.type),
          }
        : {},
    );

    let { mutations } = state;

    if (
      (isRequestAction(action) && !config.isRequestActionQuery(action)) ||
      (isResponseAction(action) &&
        !config.isRequestActionQuery(getRequestActionFromResponse(action)))
    ) {
      mutations = mutationsReducer(mutations, action);
    }

    return {
      queries,
      mutations,
      cache: cacheReducer(state.cache, action),
    };
  };
};
