import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import { handleRequests } from '@redux-requests/core';
import { createDriver } from '@redux-requests/fetch';

export const configureStore = () => {
  const { requestsReducer, requestsMiddleware } = handleRequests({
    driver: createDriver(window.fetch, {
      baseURL: 'https://jsonplaceholder.typicode.com',
      AbortController: window.AbortController,
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
