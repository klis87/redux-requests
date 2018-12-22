import sinon from 'sinon';
import axios from 'axios';

import { createDriver } from './axios-driver';

describe('axiosDriver', () => {
  const axiosInstance = requestConfig => requestConfig;
  const axiosDriver = createDriver(axiosInstance);

  afterEach(() => {
    sinon.restore();
  });

  describe('requestInstance', () => {
    it('has correct value', () => {
      expect(axiosDriver.requestInstance).toBe(axiosInstance);
    });
  });

  describe('getAbortSource', () => {
    it('returns new source', () => {
      const tokenSource = {
        token: 'token',
        cancel: () => 'cancelled',
      };

      sinon.replace(
        axios.CancelToken,
        'source',
        sinon.fake.returns(tokenSource),
      );
      expect(axiosDriver.getAbortSource()).toBe(tokenSource);
    });
  });

  describe('abortRequest', () => {
    it('calls cancel method', () => {
      const abortSource = { cancel: sinon.fake() };
      axiosDriver.abortRequest(abortSource);
      expect(abortSource.cancel.callCount).toBe(1);
    });
  });

  describe('sendRequest', () => {
    it('returns correct response', () => {
      expect(axiosDriver.sendRequest({ url: '/' }, { token: 'token' })).toEqual(
        {
          url: '/',
          cancelToken: 'token',
        },
      );
    });
  });

  describe('getSuccessPayload', () => {
    it('returns response data', () => {
      const response = { data: 'data' };
      expect(axiosDriver.getSuccessPayload(response)).toEqual(response.data);
    });

    it('returns array of response data', () => {
      const responses = [{ data: 'data1' }, { data: 'data2' }];
      expect(axiosDriver.getSuccessPayload(responses)).toEqual([
        responses[0].data,
        responses[1].data,
      ]);
    });
  });

  describe('getErrorPayload', () => {
    it('returns error', () => {
      const error = 'error';
      expect(axiosDriver.getErrorPayload(error)).toBe(error);
    });
  });
});
