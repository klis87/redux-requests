import {
  success,
  error,
  abort,
  getActionWithSuffix,
  driver,
  createRequestInstance,
  getRequestInstance,
  sendRequest,
  watchRequests,
  requestsReducer,
  createRequestsReducer,
} from './index';

success('type');
error('type');
abort('type');

const actionModifier = getActionWithSuffix('suffix');
actionModifier('type');

let dummyDriver: driver;

dummyDriver.getSuccessPayload({}, {});
dummyDriver.getErrorPayload({});
const requestHandlers = dummyDriver.getRequestHandlers({}, {});
requestHandlers.sendRequest({});

createRequestInstance({}, { driver: dummyDriver });

const requestInstanceConfig = {
  success: actionModifier,
  error: actionModifier,
  abort: actionModifier,
  driver: dummyDriver,
  onRequest: request => ({}),
  onSuccess: response => ({}),
  onError: error => ({}),
  onAbort: () => ({}),
};

createRequestInstance({}, requestInstanceConfig);

getRequestInstance();

sendRequest({ type: 'type', request: {} });
sendRequest({ type: 'type', payload: { request: {} } });
sendRequest({ type: 'type', payload: { requests: [{}] } });
sendRequest({ type: 'type', requests: [{}, {}] }, true);

watchRequests();

const globalConfig = {
  getSuccessSuffix: success,
  getErrorSuffix: error,
  getAbortSuffix: abort,
  dataKey: 'data',
  errorKey: 'error',
  pendingKey: 'pending',
  multiple: false,
  getData: (state, action) => action.payload.data,
  onRequest: (state, action, { dataKey, multiple, pendingKey, errorKey }) => ({
    ...state,
    [dataKey]: null,
    [pendingKey]: state[pendingKey] + 1,
    [errorKey]: null,
  }),
  onSuccess: (state, action, { dataKey, pendingKey, errorKey, getData }) => ({
    ...state,
    [dataKey]: getData(state, action),
    [pendingKey]: state[pendingKey] - 1,
    [errorKey]: null,
  }),
  onError: (state, action, { dataKey, multiple, pendingKey, errorKey }) => ({
    ...state,
    [dataKey]: null,
    [pendingKey]: state[pendingKey] - 1,
    [errorKey]: action.payload.error,
  }),
  onAbort: (state, action, { pendingKey }) => ({
    ...state,
    [pendingKey]: state[pendingKey] - 1,
  }),
};
requestsReducer({ actionType: 'actionType' });
requestsReducer({
  actionType: 'actionType',
  ...globalConfig
});
requestsReducer({ actionType: 'actionType' }, (state, action) => state);

createRequestsReducer()({ actionType: 'actionType' });
createRequestsReducer(globalConfig)({
  actionType: 'actionType',
  ...globalConfig
});
