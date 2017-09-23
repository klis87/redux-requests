import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { fork } from 'redux-saga/effects';
import { createRequestInstance, fetchApiDriver } from 'redux-saga-requests';

import { photoReducer, postReducer, abortCounterReducer } from './reducers';
import { photoSaga, postSaga } from './sagas';

function* rootSaga() {
  yield createRequestInstance(
    window.fetch,
    { driver: fetchApiDriver, baseURL: 'https://jsonplaceholder.typicode.com' },
  );
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
  const composeEnhancers = (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

  const store = createStore(
    reducers,
    composeEnhancers(
      applyMiddleware(sagaMiddleware),
    ),
  );

  sagaMiddleware.run(rootSaga);
  return store;
};
