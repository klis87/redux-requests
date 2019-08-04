import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import {
  createRequestInstance,
  watchRequests,
  networkReducer,
} from 'redux-saga-requests';
import { createDriver } from 'redux-saga-requests-fetch';

import { abortCounterReducer } from './reducers';

function* rootSaga() {
  yield createRequestInstance({
    driver: createDriver(window.fetch, {
      baseURL: 'https://jsonplaceholder.typicode.com',
      AbortController: window.AbortController,
    }),
  });
  yield watchRequests();
}

export const configureStore = () => {
  const reducers = combineReducers({
    network: networkReducer(),
    abortCounter: abortCounterReducer,
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

  sagaMiddleware.run(rootSaga);
  return store;
};
