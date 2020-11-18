import defaultConfig from '../default-config';
import { isResponseAction, getRequestActionFromResponse } from '../actions';

import queriesReducer from './queries-reducer';
import mutationsReducer from './mutations-reducer';
import requestKeysReducer from './requests-keys-reducer';
import cacheReducer from './cache-reducer';
import requestsResetReducer from './requests-reset-reducer';
import ssrReducer from './ssr-reducer';

const defaultState = {
  queries: {},
  mutations: {},
  normalizedData: {},
  cache: {},
  requestsKeys: {},
};

export default (config = defaultConfig) => (state = defaultState, action) => {
  const { queries, normalizedData } = queriesReducer(
    { queries: state.queries, normalizedData: state.normalizedData },
    action,
    config,
  );

  let { mutations } = state;

  if (
    (config.isRequestAction(action) && !config.isRequestActionQuery(action)) ||
    (isResponseAction(action) &&
      !config.isRequestActionQuery(getRequestActionFromResponse(action)))
  ) {
    mutations = mutationsReducer(mutations, action);
  }

  return {
    ...requestKeysReducer(
      {
        ...requestsResetReducer(
          {
            queries,
            mutations,
            cache: cacheReducer(state.cache, action),
          },
          action,
        ),
        requestsKeys: state.requestsKeys,
      },
      action,
      config,
    ),
    normalizedData,
    ssr: config.ssr ? ssrReducer(state.ssr, action, config) : null,
  };
};
