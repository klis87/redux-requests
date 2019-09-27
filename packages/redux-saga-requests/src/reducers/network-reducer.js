import {
  isRequestAction,
  isResponseAction,
  getRequestActionFromResponse,
} from '../actions';
import defaultConfig from './default-config';
import queriesReducer from './queries-reducer';
import mutationsReducer from './mutations-reducer';
import cacheReducer from './cache-reducer';

export default localConfig => {
  const config = { ...defaultConfig, ...localConfig };

  return (state = { queries: {}, mutations: {}, cache: {} }, action) => {
    const queries = queriesReducer(state.queries, action, config);

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
