import { createDriver } from './index';

const requestAction = {
  type: 'FETCH',
  request: { url: '/' },
  meta: { driver: 'default' },
};

const axiosDriver = createDriver({});
axiosDriver.getSuccessPayload({}, {});
axiosDriver.getErrorPayload({});
axiosDriver.sendRequest({}, {}, requestAction);
