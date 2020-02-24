import { setContext } from 'redux-saga/effects';

import defaultConfig from '../default-config';
import { REQUESTS_CONFIG } from '../constants';
import createRequestInstance from './create-request-instance';

describe('sagas', () => {
  describe('createRequestInstance', () => {
    it('returns correct effect with default config', () => {
      expect(createRequestInstance()).toEqual(
        setContext({
          [REQUESTS_CONFIG]: defaultConfig,
        }),
      );
    });

    it('returns correct effect with overwritten config', () => {
      const voidCallback = () => {};

      const config = {
        driver: 'some driver',
        onRequest: voidCallback,
        onSuccess: voidCallback,
        onError: voidCallback,
        onAbort: voidCallback,
      };

      expect(createRequestInstance(config)).toEqual(
        setContext({
          [REQUESTS_CONFIG]: config,
        }),
      );
    });
  });
});
