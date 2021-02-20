import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import { handleRequests } from '@redux-requests/core';
import { createDriver, createSubscriber } from '@redux-requests/graphql';

export const configureStore = () => {
  const { requestsReducer, requestsMiddleware } = handleRequests({
    driver: createDriver({
      url: 'http://localhost:3000/graphql',
    }),
    subscriber: createSubscriber({
      url: 'ws://localhost:3000/graphql',
      // lazy: false,
      heartbeatTimeout: 12,
      useHeartbeat: true,
    }),
  });

  const reducers = combineReducers({
    requests: requestsReducer,
  });

  const composeEnhancers =
    (typeof window !== 'undefined' &&
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
    compose;

  const store = createStore(
    reducers,
    composeEnhancers(applyMiddleware(...requestsMiddleware)),
  );

  return store;
};
