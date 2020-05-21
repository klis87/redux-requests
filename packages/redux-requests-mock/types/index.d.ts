import { Driver } from '@redux-requests/core';

interface MockDriverConfig {
  timeout?: number;
}

export const createDriver: (mockDriverConfig?: MockDriverConfig) => Driver;
