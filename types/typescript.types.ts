import {
  success,
  error,
  abort,
  getActionWithSuffix,
  fetchApiDriver,
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

fetchApiDriver.getSuccessPayload({}, {});
fetchApiDriver.getErrorPayload({});
const requestHandlers = fetchApiDriver.getRequestHandlers({}, {});
requestHandlers.sendRequest({});

createRequestInstance({});

const requestInstanceConfig = {
  success: actionModifier,
  error: actionModifier,
  abort: actionModifier,
  driver: fetchApiDriver,
  onRequest: request => ({}),
  onSuccess: response => ({}),
  onError: error => ({}),
  onAbort: () => ({}),
}
createRequestInstance({}, requestInstanceConfig);

getRequestInstance();

sendRequest({ type: 'type', request: {} });
sendRequest({ type: 'type', payload: { request: {} } });
sendRequest({ type: 'type', payload: { requests: [{}] } });
sendRequest({ type: 'type', requests: [{}, {}] }, true);

watchRequests();
