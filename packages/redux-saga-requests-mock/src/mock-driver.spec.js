import { assert } from 'chai';
import sinon from 'sinon';

import { createDriver } from './mock-driver';

describe('mockDriver', () => {
  const mockInstance = {
    FETCH_LIST: () => ({ data: ['item1', 'item2'] }),
    FETCH_DETAIL: (requestConfig, requestAction) => ({
      data: { id: requestConfig.body.id, type: requestAction.type },
    }),
    FETCH_ERROR: () => {
      throw 'responseError';
    },
  };

  const mockDriver = createDriver(mockInstance);

  afterEach(() => {
    sinon.restore();
  });

  describe('requestInstance', () => {
    it('has correct value', () => {
      assert.equal(mockDriver.requestInstance, mockInstance);
    });
  });

  describe('getAbortSource', () => {
    it('returns new source', () => {
      assert.equal(mockDriver.getAbortSource().cancel(), true);
    });
  });

  describe('abortRequest', () => {
    it('calls cancel method', () => {
      const abortSource = { cancel: sinon.fake() };
      mockDriver.abortRequest(abortSource);
      assert.equal(abortSource.cancel.callCount, 1);
    });
  });

  describe('sendRequest', () => {
    it('returns correct response', async () => {
      const response = await mockDriver.sendRequest({ url: '/' }, null, {
        type: 'FETCH_LIST',
        request: { url: '/' },
      });
      assert.deepEqual(response, { data: ['item1', 'item2'] });
    });

    it('returns correct dynamic response based on request action params', async () => {
      const requestConfig = {
        url: '/',
        body: { id: 1 },
      };
      const response = await mockDriver.sendRequest(requestConfig, null, {
        type: 'FETCH_DETAIL',
        request: requestConfig,
      });
      assert.deepEqual(response, { data: { id: 1, type: 'FETCH_DETAIL' } });
    });

    it('handles error response', async () => {
      let error;

      try {
        await mockDriver.sendRequest({ url: '/' }, null, {
          type: 'FETCH_ERROR',
          request: { url: '/' },
        });
      } catch (e) {
        error = e;
      }
      assert.deepEqual(error, 'responseError');
    });
  });

  describe('getSuccessPayload', () => {
    it('returns response data', () => {
      const response = { data: 'data' };
      assert.deepEqual(mockDriver.getSuccessPayload(response), response.data);
    });

    it('returns array of response data', () => {
      const responses = [{ data: 'data1' }, { data: 'data2' }];
      assert.deepEqual(mockDriver.getSuccessPayload(responses), [
        responses[0].data,
        responses[1].data,
      ]);
    });
  });

  describe('getErrorPayload', () => {
    it('returns error', () => {
      const error = 'error';
      assert.equal(mockDriver.getErrorPayload(error), error);
    });
  });
});
