import { createDriver } from './index';

const mockDriver = createDriver({});
createDriver({ timeout: 1 });
mockDriver({}, { type: 'MOCK', request: { response: { data: 'data' } } }, {});
