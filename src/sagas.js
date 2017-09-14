import { setContext } from 'redux-saga/effects';

import { REQUEST_INSTANCE } from './constants';

export function saveRequestInstance(requestInstance) {
  return setContext({ [REQUEST_INSTANCE]: requestInstance });
}
