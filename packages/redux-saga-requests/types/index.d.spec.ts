import {
  success,
  error,
  abort,
  getActionWithSuffix,
  Driver,
  DriverCreator,
  createRequestInstance,
  getRequestInstance,
  sendRequest,
  watchRequests,
  requestsReducer,
  createRequestsReducer,
  requestsPromiseMiddleware,
} from './index';

success('type');
error('type');
abort('type');

const actionModifier = getActionWithSuffix('suffix');
actionModifier('type');

let dummyDriver: Driver;
dummyDriver.requestInstance = {};
dummyDriver.getAbortSource();
dummyDriver.abortRequest({});
dummyDriver.sendRequest({}, {});
dummyDriver.getSuccessPayload({}, {});
dummyDriver.getErrorPayload({});

const driverCreator: DriverCreator = () => dummyDriver;
driverCreator({});

createRequestInstance({ driver: dummyDriver });

const successAction = (action, data) => ({ type: 'SUCCESS', data });
const errorAction = (action, data) => ({ type: 'ERROR', data });
const abortAction = action => ({ type: 'ABORT' });

const requestInstanceConfig = {
  success: actionModifier,
  error: actionModifier,
  abort: actionModifier,
  successAction,
  errorAction,
  abortAction,
  driver: dummyDriver,
  onRequest: (request, action) => request,
  onSuccess: (response, action) => response,
  onError: (error, action) => ({ error }),
  onAbort: action => {},
};

createRequestInstance(requestInstanceConfig);

getRequestInstance();

sendRequest({ type: 'type', request: {} });
sendRequest({ type: 'type', payload: { request: {} } });
sendRequest({ type: 'type', payload: { request: [{}] } });
sendRequest(
  { type: 'type', request: [{}, {}] },
  {
    dispatchRequestAction: true,
    silent: false,
    runOnRequest: false,
    runOnSuccess: false,
    runOnError: false,
    runOnAbort: false,
  },
);

watchRequests();
watchRequests({
  takeLatest: true,
  abortOn: 'TYPE',
  getLastActionKey: action => action.type,
});
watchRequests({ abortOn: ['TYPE'] });
watchRequests(
  {
    abortOn: action => action.type === 'TYPE',
    takeLatest: action => action.type === 'TYPE',
  },
  {
    ACTION1: {
      abortOn: action => action.type === 'TYPE',
    },
    ACTION2: {
      takeLatest: false,
      getLastActionKey: action => action.type,
      abortOn: action => action.type === 'TYPE',
    },
  },
);

const globalConfig = {
  success,
  error,
  abort,
  dataKey: 'data',
  errorKey: 'error',
  pendingKey: 'pending',
  multiple: false,
  getData: (state, action) => action.payload.data,
  getError: (state, action) => action.payload,
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
  resetOn: ['RESET'],
};
requestsReducer({
  actionType: 'actionType',
  resetOn: action => action.type === 'SOME_TYPE',
});
requestsReducer({
  actionType: 'actionType',
  ...globalConfig,
});
requestsReducer({ actionType: 'actionType' }, (state, action) => state);

createRequestsReducer()({ actionType: 'actionType' });
createRequestsReducer(globalConfig)({
  actionType: 'actionType',
  ...globalConfig,
});

requestsPromiseMiddleware();
requestsPromiseMiddleware({ auto: true });
requestsPromiseMiddleware({
  success,
  getRequestAction: action => action.requestAction || null,
});
