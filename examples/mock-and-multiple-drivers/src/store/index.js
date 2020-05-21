import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import axios from 'axios';
import { handleRequests } from '@redux-requests/core';
import { createDriver as createAxiosDriver } from '@redux-requests/axios';
import { createDriver as createMockDriver } from '@redux-requests/mock';

import { FETCH_PHOTO } from './constants';

export const configureStore = () => {
  const { requestsReducer, requestsMiddleware } = handleRequests({
    driver: {
      default: createAxiosDriver(
        axios.create({
          baseURL: 'https://jsonplaceholder.typicode.com',
        }),
      ),
      mock: createMockDriver({ timeout: 1000 }),
    },
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
