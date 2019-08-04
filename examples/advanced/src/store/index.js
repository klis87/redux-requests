import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import axios from 'axios';
import {
  createRequestInstance,
  watchRequests,
  networkReducer,
} from 'redux-saga-requests';
import { createDriver } from 'redux-saga-requests-axios';

import {
  abortCounterReducer,
  requestCounterReducer,
  responseCounterReducer,
  errorCounterReducer,
} from './reducers';
import {
  requestCounterSaga,
  responseCounterSaga,
  errorCounterSaga,
} from './sagas';

function* rootSaga(axiosInstance) {
  yield createRequestInstance({
    onRequest: requestCounterSaga,
    onSuccess: responseCounterSaga,
    onError: errorCounterSaga,
    driver: createDriver(axiosInstance),
  });
  yield watchRequests();
}

export const configureStore = () => {
  const reducers = combineReducers({
    network: networkReducer(),
    abortCounter: abortCounterReducer,
    requestCounter: requestCounterReducer,
    responseCounter: responseCounterReducer,
    errorCounter: errorCounterReducer,
  });

  const sagaMiddleware = createSagaMiddleware();
  const composeEnhancers =
    (typeof window !== 'undefined' &&
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
    compose;

  const store = createStore(
    reducers,
    composeEnhancers(applyMiddleware(sagaMiddleware)),
  );

  const axiosInstance = axios.create({
    baseURL: 'https://jsonplaceholder.typicode.com',
  });
  sagaMiddleware.run(rootSaga, axiosInstance);
  return store;
};
