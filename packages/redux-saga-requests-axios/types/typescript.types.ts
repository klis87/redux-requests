import axiosDriver from './index';

let axiosDriverInstance: axiosDriver;
axiosDriverInstance.getSuccessPayload({}, {});
axiosDriverInstance.getErrorPayload({});
const requestHandlers = axiosDriverInstance.getRequestHandlers({}, {});
requestHandlers.sendRequest({});
requestHandlers.abortRequest();
