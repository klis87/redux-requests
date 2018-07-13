import fetchDriver from './index';

let axiosDriverInstance: fetchDriver;
axiosDriverInstance.getSuccessPayload({}, {});
axiosDriverInstance.getErrorPayload({});
const requestHandlers = axiosDriverInstance.getRequestHandlers({}, {});
requestHandlers.sendRequest({});
