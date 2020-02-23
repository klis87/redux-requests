import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { put, call, all } from 'redux-saga/effects';
import axios from 'axios';
import { handleRequests, sendRequest } from 'redux-saga-requests';
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

function* rootSaga(requestsSagas) {
  yield all([...requestsSagas, call(bookSaga)]);
}

export const configureStore = (initialState = undefined) => {
  const ssr = !initialState; // if initiaState is not passed, it means we run it on server

  const {
    requestsReducer,
    requestsMiddleware,
    requestsSagas,
    requestsPromise,
  } = handleRequests({
    driver: createDriver(
      axios.create({
        baseURL: 'http://localhost:3000',
      }),
    ),
    serverSsr: ssr,
    clientSsr: !ssr,
    cache: true,
    serverRequestActions: !ssr && window.__SERVER_REQUEST_ACTIONS__,
  });

  const reducers = combineReducers({
    network: requestsReducer,
  });

  const sagaMiddleware = createSagaMiddleware();
  const composeEnhancers =
    typeof window !== 'undefined'
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      : compose;

  const middlewares = [...requestsMiddleware, sagaMiddleware];

  const store = createStore(
    reducers,
    initialState,
    composeEnhancers(applyMiddleware(...middlewares)),
  );

  sagaMiddleware.run(rootSaga, requestsSagas);

  return { store, requestsPromise };
};
