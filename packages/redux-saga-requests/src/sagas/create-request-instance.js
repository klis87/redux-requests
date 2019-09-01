import { setContext } from 'redux-saga/effects';

import { REQUESTS_CONFIG } from '../constants';

export const defaultRequestInstanceConfig = {
  driver: null,
  onRequest: null,
  onSuccess: null,
  onError: null,
  onAbort: null,
};

export default function createRequestInstance(config) {
  return setContext({
    [REQUESTS_CONFIG]: { ...defaultRequestInstanceConfig, ...config },
  });
}
