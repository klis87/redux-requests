import { Driver } from 'redux-saga-requests';

interface MockDriverConfig {
  timeout?: number;
}

export const createDriver: (
  mockInstance: any,
  mockDriverConfig?: MockDriverConfig,
) => Driver;
