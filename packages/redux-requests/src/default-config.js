import { isRequestActionQuery } from './actions';

export default {
  driver: null,
  onRequest: null,
  onSuccess: null,
  onError: null,
  onAbort: null,
  ssr: null,
  disableRequestsPromise: false,
  takeLatest: isRequestActionQuery,
  normalize: false,
  getNormalisationObjectKey: obj => obj.id,
  shouldObjectBeNormalized: obj => obj.id !== undefined,
  subscriber: null,
};
