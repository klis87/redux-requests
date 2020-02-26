import { isRequestActionQuery, isRequestAction } from './actions';

export default {
  driver: null,
  onRequest: null,
  onSuccess: null,
  onError: null,
  onAbort: null,
  cache: false,
  promisify: false,
  autoPromisify: false,
  ssr: null,
  isRequestAction,
  isRequestActionQuery,
  takeLatest: isRequestActionQuery,
  abortOn: null,
  normalize: false,
  getNormalisationObjectKey: obj => obj.id,
  shouldObjectBeNormalized: obj => obj.id !== undefined,
};
