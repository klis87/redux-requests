import { createDriver } from './index';

const requestAction = {
  type: 'FETCH',
  request: { url: '/' },
  meta: { driver: 'default' },
};
const mockDriver = createDriver({});
createDriver({}, { timeout: 1 });
mockDriver.sendRequest({}, requestAction);
