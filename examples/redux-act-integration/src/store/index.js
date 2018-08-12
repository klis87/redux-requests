import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import axios from 'axios';
import { createRequestInstance, watchRequests } from 'redux-saga-requests';
import { createDriver } from 'redux-saga-requests-axios';

import { photoReducer, postReducer, abortCounterReducer } from './reducers';
import {
  success,
  error,
  abort,
  fetchPhoto,
  clearPhoto,
  fetchPost,
  clearPost,
} from './actions';

function* rootSaga(axiosInstance) {
  yield createRequestInstance({
    driver: createDriver(axiosInstance),
    success,
    error,
    abort,
  });
  yield watchRequests(null, {
    [fetchPhoto]: { abortOn: clearPhoto },
    [fetchPost]: { abortOn: clearPost },
  });
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
