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
