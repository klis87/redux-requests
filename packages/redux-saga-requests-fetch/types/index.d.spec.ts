import { createDriver } from './index';

const requestAction = {
  type: 'FETCH',
  request: { url: '/' },
  meta: { driver: 'default' },
};
const fetchDriver = createDriver({});
fetchDriver.getSuccessPayload({}, {});
fetchDriver.getErrorPayload({});
fetchDriver.sendRequest({}, {}, requestAction);
