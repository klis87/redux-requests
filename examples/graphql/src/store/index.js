import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { handleRequests } from 'redux-saga-requests';
import { createDriver } from 'redux-saga-requests-graphql';

export const configureStore = () => {
  const { requestsReducer, requestsSaga } = handleRequests({
    driver: createDriver({ url: 'http://localhost:3000/graphql' }),
  });

  const reducers = combineReducers({
    network: requestsReducer,
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

  sagaMiddleware.run(requestsSaga);
  return store;
};
