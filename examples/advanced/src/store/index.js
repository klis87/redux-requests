import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { fork } from 'redux-saga/effects';
import axios from 'axios';
import { createRequestInstance } from 'redux-saga-requests';
import axiosDriver from 'redux-saga-requests-axios';

import {
  photoReducer,
  postReducer,
  abortCounterReducer,
  requestCounterReducer,
} from './reducers';
import { photoSaga, postSaga, requestCounterSaga } from './sagas';

function* rootSaga(axiosInstance) {
  yield createRequestInstance(axiosInstance, {
    onRequest: requestCounterSaga,
    driver: axiosDriver,
  });
  yield fork(photoSaga);
  yield fork(postSaga);
}

export const configureStore = () => {
  const reducers = combineReducers({
    photo: photoReducer,
    post: postReducer,
    abortCounter: abortCounterReducer,
    requestCounter: requestCounterReducer,
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
