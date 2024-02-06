import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import axios from 'axios';
import { handleRequests } from '@redux-requests/core';
import { createDriver } from '@redux-requests/axios';

import { fetchBooks } from './actions';

export const configureStore = (initialState = undefined) => {
  const ssr = !initialState; // if initialState is not passed, it means we run it on server

  const {
    requestsReducer,
    requestsMiddleware,
    requestsPromise,
  } = handleRequests({
    driver: createDriver(
      axios.create({
        baseURL: 'http://localhost:3000',
      }),
    ),
    ssr: ssr ? 'server' : 'client',
  });

  const reducers = combineReducers({
    requests: requestsReducer,
  });

  const composeEnhancers =
    typeof window !== 'undefined'
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      : compose;

  const store = createStore(
    reducers,
    initialState,
    composeEnhancers(applyMiddleware(...requestsMiddleware)),
  );

  store.dispatch(fetchBooks());

  return { store, requestsPromise };
};
