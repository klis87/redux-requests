import { getContext } from 'redux-saga/effects';

import { REQUESTS_CONFIG } from '../constants';

export function getRequestsConfig() {
  return getContext(REQUESTS_CONFIG);
}
