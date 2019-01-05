import { Driver } from 'redux-saga-requests';

type FetchDriverConfig = {
  baseURL?: string;
  AbortController?: any;
};

export const createDriver: (
  fetchInstance: any,
  fetchDriverConfig?: FetchDriverConfig,
) => Driver;
