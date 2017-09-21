import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { fork } from 'redux-saga/effects';
import { createRequestInstance, fetchApiDriver } from 'redux-saga-requests';

import { postsReducer, abortCounterReducer } from './reducers';
import { postsSaga } from './sagas';

function* rootSaga() {
  yield createRequestInstance(window.fetch, { driver: fetchApiDriver });
  yield fork(postsSaga);
}

export const configureStore = () => {
  const reducers = combineReducers({
    posts: postsReducer,
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
