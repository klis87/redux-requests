import {
  isRequestAction,
  isResponseAction,
  getRequestActionFromResponse,
} from '../actions';
import defaultConfig from './default-config';
import queriesReducer from './queries-reducer';
import mutationsReducer from './mutations-reducer';
import requestKeysReducer from './requests-keys-reducer';
import cacheReducer from './cache-reducer';

const defaultState = {
  queries: {},
  mutations: {},
  normalizedData: {},
  cache: {},
  requestsKeys: {},
};

export default localConfig => {
  const config = { ...defaultConfig, ...localConfig };

  return (state = defaultState, action) => {
    const { queries, normalizedData } = queriesReducer(
      { queries: state.queries, normalizedData: state.normalizedData },
      action,
      config,
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
      ...requestKeysReducer(
        {
          queries,
          mutations,
          cache: cacheReducer(state.cache, action),
          requestsKeys: state.requestsKeys,
        },
        action,
      ),
      normalizedData,
    };
  };
};
