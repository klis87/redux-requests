import { Driver } from '@redux-requests/core';

interface FetchDriverConfig {
  baseURL?: string;
  AbortController?: any;
}

export const createDriver: (
  fetchInstance: any,
  fetchDriverConfig?: FetchDriverConfig,
) => Driver;
