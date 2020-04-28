import { Driver } from '@redux-requests/core';

interface MockDriverConfig {
  timeout?: number;
}

export const createDriver: (
  mockInstance: any,
  mockDriverConfig?: MockDriverConfig,
) => Driver;
