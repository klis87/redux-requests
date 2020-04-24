import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import axios from 'axios';
import { handleRequests } from 'redux-saga-requests';
import { createDriver } from 'redux-saga-requests-axios';

import {
  abortCounterReducer,
  requestCounterReducer,
  responseCounterReducer,
  errorCounterReducer,
} from './reducers';
import { onRequest, onSuccess, onError } from './interceptors';

export const configureStore = () => {
  const { requestsReducer, requestsMiddleware } = handleRequests({
    driver: createDriver(
      axios.create({
        baseURL: 'https://jsonplaceholder.typicode.com',
      }),
    ),
    onRequest,
    onSuccess,
    onError,
  });

  const reducers = combineReducers({
    requests: requestsReducer,
    abortCounter: abortCounterReducer,
    requestCounter: requestCounterReducer,
    responseCounter: responseCounterReducer,
    errorCounter: errorCounterReducer,
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
