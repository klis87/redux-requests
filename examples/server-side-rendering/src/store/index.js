import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { all, put, call } from 'redux-saga/effects';
import axios from 'axios';
import {
  createRequestInstance,
  watchRequests,
  serverRequestsFilterMiddleware,
  countServerRequests,
  sendRequest,
  networkReducer,
} from 'redux-saga-requests';
import { createDriver } from 'redux-saga-requests-axios';

import { fetchBooks, fetchBooksScreeningActors } from './actions';

function* bookSaga() {
  const { response } = yield call(sendRequest, fetchBooks(), {
    dispatchRequestAction: true,
  });

  if (response) {
    yield put(fetchBooksScreeningActors(response.data.map(v => v.id)));
  }
}

function* rootSaga(ssr = false, serverRequestActions) {
  yield createRequestInstance({
    driver: createDriver(
      axios.create({
        baseURL: 'http://localhost:3000',
      }),
    ),
  });

  yield all(
    [
      ssr && call(countServerRequests, { serverRequestActions }),
      call(watchRequests),
      call(bookSaga),
    ].filter(Boolean),
  );
}

export const configureStore = (initialState = undefined) => {
  const ssr = !initialState; // if initiaState is not passed, it means we run it on server
  const reducers = combineReducers({
    network: networkReducer(),
  });

  const sagaMiddleware = createSagaMiddleware();
  const composeEnhancers =
    typeof window !== 'undefined'
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      : compose;

  const middlewares = [
    !ssr &&
      serverRequestsFilterMiddleware({
        serverRequestActions: window.__SERVER_REQUEST_ACTIONS__,
      }),
    sagaMiddleware,
  ].filter(Boolean);

  const store = createStore(
    reducers,
    initialState,
    composeEnhancers(applyMiddleware(...middlewares)),
  );

  store.runSaga = serverRequestActions =>
    sagaMiddleware.run(rootSaga, ssr, serverRequestActions);
  return store;
};
