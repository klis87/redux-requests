import { requestsReducer } from './reducers';
import {
  createRequestsCacheMiddleware,
  createClientSsrMiddleware,
  createServerSsrMiddleware,
  createSendRequestsMiddleware,
  createPollingMiddleware,
  createSubscriptionsMiddleware,
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
  const requestsPromise =
    config.ssr === 'server' && !config.disableRequestsPromise ? defer() : null;

  return {
    requestsReducer: requestsReducer(config),
    requestsMiddleware: [
      config.ssr !== 'server' &&
        config.subscriber &&
        createSubscriptionsMiddleware(config),
      config.ssr !== 'server' && createPollingMiddleware(config),
      config.ssr === 'server' &&
        !config.disableRequestsPromise &&
        createServerSsrMiddleware(requestsPromise, config),
      config.ssr === 'client' && createClientSsrMiddleware(config),
      config.cache && createRequestsCacheMiddleware(config),
      createSendRequestsMiddleware(config),
    ].filter(Boolean),
    requestsPromise,
  };
};

export default handleRequests;
