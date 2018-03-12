import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { createRequestInstance, watchRequests } from 'redux-saga-requests';
import fetchDriver from 'redux-saga-requests-fetch';

import { photoReducer, postReducer, abortCounterReducer } from './reducers';
import { FETCH_PHOTO, CLEAR_PHOTO, FETCH_POST, CLEAR_POST } from './constants';

function* rootSaga() {
  yield createRequestInstance(window.fetch, {
    driver: fetchDriver,
    baseURL: 'https://jsonplaceholder.typicode.com',
  });
  yield watchRequests(null, {
    [FETCH_PHOTO]: { abortOn: CLEAR_PHOTO },
    [FETCH_POST]: { abortOn: CLEAR_POST },
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

  sagaMiddleware.run(rootSaga);
  return store;
};
