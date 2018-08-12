import { createDriver } from './index';

const axiosDriver = createDriver({});
axiosDriver.getSuccessPayload({}, {});
axiosDriver.getErrorPayload({});
axiosDriver.sendRequest({}, {});
