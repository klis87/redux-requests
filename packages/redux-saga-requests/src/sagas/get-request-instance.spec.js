import { getContext } from 'redux-saga/effects';
import { expectSaga } from 'redux-saga-test-plan';

import { REQUESTS_CONFIG } from '../constants';
import getRequestInstance, { getRequestsConfig } from './get-request-instance';

describe('sagas', () => {
  describe('getRequestsConfig', () => {
    it('returns correct effect', () => {
      expect(getRequestsConfig()).toEqual(getContext(REQUESTS_CONFIG));
    });
  });

  describe('getRequestInstance', () => {
    it('returns correct effect', () => {
      return expectSaga(getRequestInstance)
        .provide([
          [
            getContext(REQUESTS_CONFIG),
            { driver: { requestInstance: 'requestInstance' } },
          ],
        ])
        .returns('requestInstance')
        .run();
    });

    it('handles driver as object', () => {
      return expectSaga(getRequestInstance)
        .provide([
          [
            getContext(REQUESTS_CONFIG),
            {
              driver: {
                default: {
                  requestInstance: 'requestInstance',
                },
              },
            },
          ],
        ])
        .returns('requestInstance')
        .run();
    });

    it('handles not default driver as object', () => {
      return expectSaga(getRequestInstance, 'another')
        .provide([
          [
            getContext(REQUESTS_CONFIG),
            {
              driver: {
                default: { requestInstance: 'requestInstance' },
                another: { requestInstance: 'anotherRequestInstance' },
              },
            },
          ],
        ])
        .returns('anotherRequestInstance')
        .run();
    });
  });
});
