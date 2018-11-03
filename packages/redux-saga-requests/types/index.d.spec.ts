import {
  success,
  error,
  abort,
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

const requestAction = {
  type: 'FETCH',
  request: { url: '/' },
  meta: { driver: 'default', asPromise: true, customKey: 'customValue' },
};

let dummyDriver: Driver;
dummyDriver.requestInstance = {};
dummyDriver.getAbortSource();
dummyDriver.abortRequest({});
dummyDriver.sendRequest({}, {}, requestAction);
dummyDriver.getSuccessPayload({}, {});
dummyDriver.getErrorPayload({});

const driverCreator: DriverCreator = () => dummyDriver;
driverCreator({});

createRequestInstance({ driver: dummyDriver });
createRequestInstance({
  driver: { default: dummyDriver, anotherDriver: dummyDriver },
});

const requestInstanceConfig = {
  driver: dummyDriver,
  onRequest: (request, action) => request,
  onSuccess: (response, action) => response,
  onError: (error, action) => ({ error }),
  onAbort: action => {},
};

createRequestInstance(requestInstanceConfig);

getRequestInstance();
getRequestInstance('notDefault');

sendRequest(requestAction);
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
  multiple: false,
  getData: (state, action) => action.payload.data,
  getError: (state, action) => action.payload,
  onRequest: (state, action, { multiple }) => ({
    ...state,
    data: null,
    pending: state.pending + 1,
    error: null,
  }),
  onSuccess: (state, action, { getData }) => ({
    ...state,
    data: getData(state, action),
    pending: state.pending - 1,
    error: null,
  }),
  onError: (state, action, { multiple }) => ({
    ...state,
    data: null,
    pending: state.pending - 1,
    error: action.payload.error,
  }),
  onAbort: (state, action) => ({
    ...state,
    pending: state.pending - 1,
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
requestsReducer({
  actionType: 'actionType',
  operations: {
    OPERATION: true,
  },
});
requestsReducer({
  actionType: 'actionType',
  operations: {
    OPERATION: { updateData: true },
  },
});
requestsReducer({
  actionType: 'actionType',
  operations: {
    OPERATION: { updateData: (state, action) => state },
  },
});
requestsReducer({
  actionType: 'actionType',
  operations: {
    OPERATION: {
      getRequestKey: action => 'id',
      updateData: (state, action) => state,
    },
  },
});
requestsReducer({ actionType: 'actionType' }, (state, action) => state);

createRequestsReducer()({ actionType: 'actionType' });
createRequestsReducer(globalConfig)({
  actionType: 'actionType',
  ...globalConfig,
});

requestsPromiseMiddleware();
requestsPromiseMiddleware({ auto: true });
