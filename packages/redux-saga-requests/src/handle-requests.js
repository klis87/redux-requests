import { networkReducer } from './reducers';
import { createRequestInstance, watchRequests } from './sagas';
import {
  createRequestsPromiseMiddleware,
  requestsCacheMiddleware,
} from './middleware';

const handleRequests = ({
  driver,
  onRequest,
  onSuccess,
  onError,
  onAbort,
  cache = false,
  promisify = false,
}) => ({
  requestsReducer: networkReducer(),
  requestsMiddleware: [
    cache && requestsCacheMiddleware,
    promisify && createRequestsPromiseMiddleware(),
  ].filter(Boolean),
  requestsSaga: function* requestsSaga() {
    yield createRequestInstance({
      driver,
      onRequest,
      onSuccess,
      onError,
      onAbort,
    });
    yield watchRequests();
  },
});

export default handleRequests;
