import { Driver } from 'redux-saga-requests';

interface PromiseDriverConfig {
  AbortController?: AbortController;
  processResponse?: (response: any) => { data: any };
}

export const createDriver: (config?: PromiseDriverConfig) => Driver;
