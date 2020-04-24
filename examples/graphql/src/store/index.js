import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import { handleRequests } from 'redux-saga-requests';
import { createDriver } from 'redux-saga-requests-graphql';

export const configureStore = () => {
  const { requestsReducer, requestsMiddleware } = handleRequests({
    driver: createDriver({ url: 'http://localhost:3000/graphql' }),
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

  return store;
};
