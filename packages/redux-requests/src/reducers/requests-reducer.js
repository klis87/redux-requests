import defaultConfig from '../default-config';
import { isResponseAction, getRequestActionFromResponse } from '../actions';

import queriesReducer from './queries-reducer';
import mutationsReducer from './mutations-reducer';
import requestKeysReducer from './requests-keys-reducer';
import cacheReducer from './cache-reducer';
import progressReducer from './progress-reducer';
import requestsResetReducer from './requests-reset-reducer';
import ssrReducer from './ssr-reducer';
import watchersReducer from './watchers-reducer';
import websocketReducer from './websocket-reducer';

const defaultState = {
  queries: {},
  mutations: {},
  normalizedData: {},
  cache: {},
  downloadProgress: {},
  uploadProgress: {},
  requestsKeys: {},
  watchers: {},
  websocket: { pristine: true, connected: false },
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
            ...progressReducer(
              {
                downloadProgress: state.downloadProgress,
                uploadProgress: state.uploadProgress,
              },
              action,
              config,
            ),
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
    watchers: watchersReducer(state.watchers, action, config),
    websocket: websocketReducer(state.websocket, action, config),
  };
};
