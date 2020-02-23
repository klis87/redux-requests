import { fork } from 'redux-saga/effects';

import { networkReducer } from './reducers';
import { createRequestInstance, watchRequests } from './sagas';
import {
  createRequestsPromiseMiddleware,
  requestsCacheMiddleware,
  createClientSsrMiddleware,
  createServerSsrMiddleware,
} from './middleware';

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

const handleRequests = ({
  driver,
  onRequest,
  onSuccess,
  onError,
  onAbort,
  cache = false,
  promisify = false,
  ssr = null,
}) => {
  const requestsPromise = ssr === 'server' ? defer() : null;

  return {
    requestsReducer: networkReducer({ ssr }),
    requestsMiddleware: [
      ssr === 'server' && createServerSsrMiddleware({ requestsPromise }),
      ssr === 'client' && createClientSsrMiddleware(),
      cache && requestsCacheMiddleware,
      promisify && createRequestsPromiseMiddleware(),
    ].filter(Boolean),
    requestsSagas: [
      createRequestInstance({
        driver,
        onRequest,
        onSuccess,
        onError,
        onAbort,
      }),
      fork(watchRequests),
    ],
    requestsPromise,
  };
};
export default handleRequests;
