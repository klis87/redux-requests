import { createDriver } from './index';

const fetchDriver = createDriver({});
fetchDriver.getSuccessPayload({}, {});
fetchDriver.getErrorPayload({});
fetchDriver.sendRequest({}, {});
