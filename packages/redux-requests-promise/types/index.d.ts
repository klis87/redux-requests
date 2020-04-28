import { Driver } from '@redux-requests/core';

interface PromiseDriverConfig {
  AbortController?: AbortController;
  processResponse?: (response: any) => { data: any };
}

export const createDriver: (config?: PromiseDriverConfig) => Driver;
