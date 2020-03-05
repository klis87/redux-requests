import { getContext } from 'redux-saga/effects';

import { REQUESTS_CONFIG } from '../constants';
import { getRequestsConfig } from './get-request-instance';

describe('sagas', () => {
  describe('getRequestsConfig', () => {
    it('returns correct effect', () => {
      expect(getRequestsConfig()).toEqual(getContext(REQUESTS_CONFIG));
    });
  });
});
