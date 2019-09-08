import { createDriver } from './index';

const requestAction = {
  type: 'FETCH',
  request: { url: '/' },
  meta: { driver: 'default' },
};
const fetchDriver = createDriver({});
createDriver({}, { AbortController: {} });
createDriver({}, { AbortController: {}, baseURL: '/' });
fetchDriver.sendRequest({}, requestAction);
