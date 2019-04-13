import {
  success,
  error,
  abort,
  Driver,
  createRequestInstance,
  getRequestInstance,
  sendRequest,
  watchRequests,
  requestsReducer,
  createRequestsReducer,
  requestsPromiseMiddleware,
  requestsCacheMiddleware,
  clearRequestsCache,
  serverRequestsFilterMiddleware,
  countServerRequests,
  RequestAction,
} from './index';

success('type');
error('type');
abort('type');

const requestAction: RequestAction = {
  type: 'FETCH',
  request: { url: '/' },
  meta: {
    driver: 'default',
    asPromise: true,
    runByWatcher: false,
    abortOn: ['ABORT'],
    takeLatest: false,
    cache: 1,
    cacheKey: 'key',
    cacheSize: 2,
    requestWeight: 1,
    responseWeight: 1,
    dependentRequest: false,
    customKey: 'customValue',
  },
};

let dummyDriver: Driver;
dummyDriver.requestInstance = {};
dummyDriver.getAbortSource();
dummyDriver.abortRequest({});
dummyDriver.sendRequest({}, {}, requestAction);
dummyDriver.getSuccessPayload({}, {});
dummyDriver.getErrorPayload({});

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

const globalConfig = {
  multiple: false,
  getDefaultData: multiple => (multiple ? [] : null),
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
requestsReducer({
  actionType: 'actionType',
  operations: {
    OPERATION: {
      updateDataOptimistic: (state, action) => state,
      revertData: (state, action) => state,
    },
  },
});
requestsReducer({
  actionType: 'actionType',
  operations: {
    OPERATION: {
      updateData: (state, action) => state,
      updateDataOptimistic: (state, action) => state,
      revertData: (state, action) => state,
      getRequestKey: action => 'id',
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

requestsCacheMiddleware();

clearRequestsCache();
clearRequestsCache('TYPE');
clearRequestsCache('TYPE', 'ANOTHER_TYPE');

serverRequestsFilterMiddleware({ serverRequestActions: [{ type: 'REQUEST' }] });

countServerRequests({ serverRequestActions: {} });
countServerRequests({ serverRequestActions: {}, finishOnFirstError: false });
