import { Driver } from 'redux-saga-requests';

interface FetchDriverConfig {
  baseURL?: string;
  AbortController?: any;
}

export const createDriver: (
  fetchInstance: any,
  fetchDriverConfig?: FetchDriverConfig,
) => Driver;
