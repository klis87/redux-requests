import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import axios from 'axios';
import {
  createRequestInstance,
  watchRequests,
  networkReducer,
} from 'redux-saga-requests';
import { createDriver as createAxiosDriver } from 'redux-saga-requests-axios';
import { createDriver as createMockDriver } from 'redux-saga-requests-mock';

import { FETCH_PHOTO } from './constants';

function* rootSaga(axiosInstance) {
  yield createRequestInstance({
    driver: {
      default: createAxiosDriver(axiosInstance),
      mock: createMockDriver(
        {
          [FETCH_PHOTO]: requestConfig => {
            const id = requestConfig.url.split('/')[2];

            if (id === '1') {
              return {
                data: {
                  albumId: 1,
                  id: 1,
                  title: 'accusamus beatae ad facilis cum similique qui sunt',
                  url: 'https://via.placeholder.com/600/92c952',
                  thumbnailUrl: 'https://via.placeholder.com/150/92c952',
                },
              };
            }

            throw { status: 404 };
          },
        },
        { timeout: 1000 },
      ),
    },
  });
  yield watchRequests();
}

export const configureStore = () => {
  const reducers = combineReducers({
    network: networkReducer(),
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

  const axiosInstance = axios.create({
    baseURL: 'https://jsonplaceholder.typicode.com',
  });
  sagaMiddleware.run(rootSaga, axiosInstance);
  return store;
};
