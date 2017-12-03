export const SUCCESS_SUFFIX = '_SUCCESS';
export const ERROR_SUFFIX = '_ERROR';
export const ABORT_SUFFIX = '_ABORT';
export const REQUEST_INSTANCE = 'REDUX_SAGA_REQUESTS_REQUEST_INSTANCE';
export const REQUESTS_CONFIG = 'REDUX_SAGA_REQUESTS_CONFIG';
export const INCORRECT_PAYLOAD_ERROR = (
  "Incorrect payload for request action. Action must have form of { type: 'TYPE', request: {} }, { type: 'TYPE', requests: [{}, {}] }, { type: 'TYPE', payload: { request: {} } } or { type: 'TYPE', payload: { requests: [{}, {}] } }"
);
