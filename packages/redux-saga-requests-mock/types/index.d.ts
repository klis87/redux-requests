import { Driver } from 'redux-saga-requests';

type MockDriverConfig = {
  timeout?: number;
  getDataFromResponse?: (response: any) => any;
};

export const createDriver: (
  mockInstance: any,
  mockDriverConfig?: MockDriverConfig,
) => Driver;
