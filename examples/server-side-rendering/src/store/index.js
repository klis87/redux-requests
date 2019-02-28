import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import createSagaMiddleware, { END } from 'redux-saga';
import { all, put, call, fork } from 'redux-saga/effects';
import axios from 'axios';
import {
  createRequestInstance,
  watchRequests,
  serverRequestsFilterMiddleware,
  countServerRequests,
  sendRequest,
} from 'redux-saga-requests';
import { createDriver } from 'redux-saga-requests-axios';

import { booksReducer, booksScreeningActorsReducer } from './reducers';
import { fetchBooks, fetchBooksScreeningActors } from './actions';

function* bookSaga() {
  const { response } = yield call(sendRequest, fetchBooks(), {
    dispatchRequestAction: true,
  });

  if (response) {
    yield put(fetchBooksScreeningActors(response.data.map(v => v.id)));
  }
}

function* rootSaga(ssr = false, serverRequestResponseActions) {
  yield createRequestInstance({
    driver: createDriver(
      axios.create({
        baseURL: 'http://localhost:3000',
      }),
    ),
  });

  yield all(
    [
      ssr && call(countServerRequests, { serverRequestResponseActions }),
      call(watchRequests),
      call(bookSaga),
    ].filter(Boolean),
  );
}

export const configureStore = (initialState = undefined, ssr = false) => {
  const reducers = combineReducers({
    books: booksReducer,
    booksScreeningActors: booksScreeningActorsReducer,
  });

  const sagaMiddleware = createSagaMiddleware();
  const composeEnhancers =
    typeof window !== 'undefined'
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      : compose;

  const middlewares = [
    !ssr &&
      serverRequestsFilterMiddleware({
        serverRequestResponseActions:
          window.__SERVER_REQUEST_RESPONSE_ACTIONS__,
      }),
    sagaMiddleware,
  ].filter(Boolean);

  const store = createStore(
    reducers,
    initialState,
    composeEnhancers(applyMiddleware(...middlewares)),
  );

  store.runSaga = serverRequestResponseActions =>
    sagaMiddleware.run(rootSaga, ssr, serverRequestResponseActions);
  store.close = () => store.dispatch(END);
  return store;
};
