export const SUCCESS_SUFFIX = '_SUCCESS';
export const ERROR_SUFFIX = '_ERROR';
export const ABORT_SUFFIX = '_ABORT';
export const REQUESTS_CONFIG = 'REDUX_SAGA_REQUESTS_CONFIG';
export const RUN_BY_INTERCEPTOR = 'RUN_BY_INTERCEPTOR';
export const INTERCEPTORS = {
  ON_REQUEST: 'onRequest',
  ON_ERROR: 'onError',
  ON_SUCCESS: 'onSuccess',
  ON_ABORT: 'onAbort',
};
export const GET_REQUEST_CACHE = 'GET_REQUEST_CACHE';
export const CLEAR_REQUESTS_CACHE = 'CLEAR_REQUESTS_CACHE';
export const INCORRECT_PAYLOAD_ERROR =
  "Incorrect payload for request action. Action must have form of { type: 'TYPE', request: {} }, { type: 'TYPE', request: [{}, {}] }, { type: 'TYPE', payload: { request: {} } } or { type: 'TYPE', payload: { request: [{}, {}] } }";
