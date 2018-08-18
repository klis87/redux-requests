import { createDriver } from './index';

const requestAction = {
  type: 'FETCH',
  request: { url: '/' },
  meta: { driver: 'default' },
};
const mockDriver = createDriver({});
mockDriver.getSuccessPayload({}, {});
mockDriver.getErrorPayload({});
mockDriver.sendRequest({}, {}, requestAction);
