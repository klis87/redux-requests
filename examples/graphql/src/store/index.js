import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { createRequestInstance, watchRequests } from 'redux-saga-requests';
import { createDriver } from 'redux-saga-requests-graphql';

import {
  booksReducer,
  bookReducer,
  fileReducer,
  filesReducer,
} from './reducers';

function* rootSaga() {
  yield createRequestInstance({
    driver: createDriver({ url: 'http://localhost:3000/graphql' }),
  });
  yield watchRequests();
}

export const configureStore = () => {
  const reducers = combineReducers({
    books: booksReducer,
    book: bookReducer,
    file: fileReducer,
    files: filesReducer,
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
