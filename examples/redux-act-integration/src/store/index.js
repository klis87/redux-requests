import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { fork } from 'redux-saga/effects';
import axios from 'axios';
import { createRequestInstance, watchRequests } from 'redux-saga-requests';
import axiosDriver from 'redux-saga-requests-axios';

import { photoReducer, postReducer, abortCounterReducer } from './reducers';
import { photoSaga, postSaga } from './sagas';
import { success, error, abort } from './actions';

function* rootSaga(axiosInstance) {
  yield createRequestInstance(axiosInstance, {
    driver: axiosDriver,
    success,
    error,
    abort,
  });
  yield fork(photoSaga);
  yield fork(postSaga);
}

export const configureStore = () => {
  const reducers = combineReducers({
    photo: photoReducer,
    post: postReducer,
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

  const axiosInstance = axios.create({
    baseURL: 'https://jsonplaceholder.typicode.com',
  });
  sagaMiddleware.run(rootSaga, axiosInstance);
  return store;
};
