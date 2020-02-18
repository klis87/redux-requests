import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
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
  const { requestsReducer, requestsSaga } = handleRequests({
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
    network: requestsReducer,
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

  sagaMiddleware.run(requestsSaga);
  return store;
};
