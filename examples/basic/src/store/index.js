import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import axios from 'axios';
import { saveRequestInstance, watchRequests } from 'redux-saga-requests';

import { postsReducer } from './reducers';

function* rootSaga(axiosInstance) {
  yield saveRequestInstance(axiosInstance);
  yield watchRequests();
}

export const configureStore = () => {
  const reducers = combineReducers({
    posts: postsReducer,
  });

  const sagaMiddleware = createSagaMiddleware();
  const composeEnhancers = (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

  const store = createStore(
    reducers,
    composeEnhancers(
      applyMiddleware(sagaMiddleware),
    ),
  );

  sagaMiddleware.run(rootSaga, axios);
  return store;
};
