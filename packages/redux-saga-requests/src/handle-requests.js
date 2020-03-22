import { fork } from 'redux-saga/effects';

import { requestsReducer } from './reducers';
import { createRequestInstance, watchRequests } from './sagas';
import {
  createRequestsPromiseMiddleware,
  createRequestsCacheMiddleware,
  createClientSsrMiddleware,
  createServerSsrMiddleware,
} from './middleware';
import defaultConfig from './default-config';

const defer = () => {
  let res;
  let rej;
  const promise = new Promise((resolve, reject) => {
    res = resolve;
    rej = reject;
  });
  promise.resolve = res;
  promise.reject = rej;
  return promise;
};

const handleRequests = userConfig => {
  const config = { ...defaultConfig, ...userConfig };
  const requestsPromise = config.ssr === 'server' ? defer() : null;

  return {
    requestsReducer: requestsReducer(config),
    requestsMiddleware: [
      config.ssr === 'server' &&
        createServerSsrMiddleware(requestsPromise, config),
      config.ssr === 'client' && createClientSsrMiddleware(config),
      config.cache && createRequestsCacheMiddleware(config),
      config.promisify && createRequestsPromiseMiddleware(config),
    ].filter(Boolean),
    requestsSagas: [createRequestInstance(config), fork(watchRequests)],
    requestsPromise,
  };
};

export default handleRequests;
