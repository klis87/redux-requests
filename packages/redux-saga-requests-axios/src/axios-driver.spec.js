import { assert } from 'chai';
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
      assert.equal(axiosDriver.requestInstance, axiosInstance);
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
      assert.equal(axiosDriver.getAbortSource(), tokenSource);
    });
  });

  describe('abortRequest', () => {
    it('calls cancel method', () => {
      const abortSource = { cancel: sinon.fake() };
      axiosDriver.abortRequest(abortSource);
      assert.equal(abortSource.cancel.callCount, 1);
    });
  });

  describe('sendRequest', () => {
    it('returns correct response', () => {
      assert.deepEqual(
        axiosDriver.sendRequest({ url: '/' }, { token: 'token' }),
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
      assert.deepEqual(axiosDriver.getSuccessPayload(response), response.data);
    });

    it('returns array of response data', () => {
      const responses = [{ data: 'data1' }, { data: 'data2' }];
      assert.deepEqual(axiosDriver.getSuccessPayload(responses), [
        responses[0].data,
        responses[1].data,
      ]);
    });
  });

  describe('getErrorPayload', () => {
    it('returns error', () => {
      const error = 'error';
      assert.equal(axiosDriver.getErrorPayload(error), error);
    });
  });
});
