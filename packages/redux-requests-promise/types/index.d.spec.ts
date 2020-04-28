import { createDriver } from './index';

createDriver();
createDriver({ processResponse: response => ({ data: response }) });
