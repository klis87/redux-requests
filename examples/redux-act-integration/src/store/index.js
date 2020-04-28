import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import axios from 'axios';
import { handleRequests } from '@redux-requests/core';
import { createDriver } from '@redux-requests/axios';

import { abortCounterReducer } from './reducers';

export const configureStore = () => {
  const { requestsReducer, requestsMiddleware } = handleRequests({
    driver: createDriver(
      axios.create({
        baseURL: 'https://jsonplaceholder.typicode.com',
      }),
    ),
  });

  const reducers = combineReducers({
    requests: requestsReducer,
    abortCounter: abortCounterReducer,
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
