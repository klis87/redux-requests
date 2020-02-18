import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { handleRequests } from 'redux-saga-requests';
import { createDriver } from 'redux-saga-requests-fetch';

import { abortCounterReducer } from './reducers';

export const configureStore = () => {
  const { requestsReducer, requestsSaga } = handleRequests({
    driver: createDriver(window.fetch, {
      baseURL: 'https://jsonplaceholder.typicode.com',
      AbortController: window.AbortController,
    }),
  });

  const reducers = combineReducers({
    network: requestsReducer,
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

  sagaMiddleware.run(requestsSaga);
  return store;
};
