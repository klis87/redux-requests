import { setContext } from 'redux-saga/effects';

import defaultConfig from '../default-config';
import { REQUESTS_CONFIG } from '../constants';

export default function createRequestInstance(config = defaultConfig) {
  return setContext({
    [REQUESTS_CONFIG]: config,
  });
}
