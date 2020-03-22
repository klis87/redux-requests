import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { all } from 'redux-saga/effects';
import axios from 'axios';
import { handleRequests } from 'redux-saga-requests';
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

export const configureStore = () => {
  const { requestsReducer, requestsSagas } = handleRequests({
    driver: createDriver(
      axios.create({
        baseURL: 'https://jsonplaceholder.typicode.com',
      }),
    ),
    onRequest: requestCounterSaga,
    onSuccess: responseCounterSaga,
    onError: errorCounterSaga,
  });

  const reducers = combineReducers({
    requests: requestsReducer,
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

  function* rootSaga() {
    yield all(requestsSagas);
  }

  sagaMiddleware.run(rootSaga);
  return store;
};
