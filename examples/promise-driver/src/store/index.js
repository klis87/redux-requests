import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import { handleRequests } from '@redux-requests/core';
import { createDriver } from '@redux-requests/promise';

export const configureStore = () => {
  const { requestsReducer, requestsMiddleware } = handleRequests({
    driver: createDriver({
      processResponse: response => ({ data: response.data }),
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
