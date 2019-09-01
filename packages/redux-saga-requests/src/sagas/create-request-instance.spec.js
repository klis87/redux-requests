import { setContext } from 'redux-saga/effects';

import { REQUESTS_CONFIG } from '../constants';
import createRequestInstance, {
  defaultRequestInstanceConfig,
} from './create-request-instance';

describe('sagas', () => {
  describe('createRequestInstance', () => {
    it('use config with correcy default value', () => {
      expect(defaultRequestInstanceConfig).toEqual({
        driver: null,
        onRequest: null,
        onSuccess: null,
        onError: null,
        onAbort: null,
      });
    });

    it('returns correct effect with default config', () => {
      expect(createRequestInstance()).toEqual(
        setContext({
          [REQUESTS_CONFIG]: defaultRequestInstanceConfig,
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
