import { getContext } from 'redux-saga/effects';

import { REQUESTS_CONFIG } from '../constants';

export function getRequestsConfig() {
  return getContext(REQUESTS_CONFIG);
}

export default function* getRequestInstance(driverType = null) {
  const config = yield getRequestsConfig();
  const driver = driverType
    ? config.driver[driverType]
    : config.driver.default || config.driver;
  return driver.requestInstance;
}
