import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import { handleRequests } from '@redux-requests/core';
import { createDriver } from '@redux-requests/axios';
import axios from 'axios';

import { fetchBooks, fetchPosts, fetchGroups } from './actions';

const refreshToken = async () => {
  console.log('we refresh token');
  return 'validToken';
};

export const configureStore = () => {
  const { requestsReducer, requestsMiddleware } = handleRequests({
    driver: createDriver(axios),
    cache: true,
    onError: async (error, action, store) => {
      if (error.response && error.response.status === 401) {
        console.log('invalid token');
        const newToken = await refreshToken();

        const { data, error: newError } = await store.dispatch({
          ...action,
          request: {
            ...action.request,
            params: { token: newToken },
          },
          meta: {
            ...action.meta,
            silent: true,
            runOnError: false,
            runOnSuccess: false,
          },
        });

        if (data) {
          return { data };
        }

        throw newError;
      }

      throw error;
    },
  });

  const reducers = combineReducers({
    requests: requestsReducer,
  });

  const composeEnhancers =
    (typeof window !== 'undefined' &&
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
    compose;

  const store = createStore(
    reducers,
    composeEnhancers(applyMiddleware(...requestsMiddleware)),
  );

  store.dispatch(fetchBooks());
  store.dispatch(fetchPosts());
  store.dispatch(fetchGroups());

  return store;
};
