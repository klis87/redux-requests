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

  describe('requestInstance', () => {
    it('has correct value', () => {
      expect(mockDriver.requestInstance).toBe(mockInstance);
    });
  });

  describe('getAbortSource', () => {
    it('returns new source', () => {
      expect(mockDriver.getAbortSource().cancel()).toBe(true);
    });
  });

  describe('abortRequest', () => {
    it('calls cancel method', () => {
      const abortSource = { cancel: jest.fn() };
      mockDriver.abortRequest(abortSource);
      expect(abortSource.cancel).toBeCalledTimes(1);
    });
  });

  describe('sendRequest', () => {
    it('returns correct response', async () => {
      const response = await mockDriver.sendRequest({ url: '/' }, null, {
        type: 'FETCH_LIST',
        request: { url: '/' },
      });
      expect(response).toEqual({ data: ['item1', 'item2'] });
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
      expect(response).toEqual({ data: { id: 1, type: 'FETCH_DETAIL' } });
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
      expect(error).toBe('responseError');
    });
  });

  describe('getSuccessPayload', () => {
    it('returns response data', () => {
      const response = { data: 'data' };
      expect(mockDriver.getSuccessPayload(response)).toEqual(response.data);
    });

    it('returns array of response data', () => {
      const responses = [{ data: 'data1' }, { data: 'data2' }];
      expect(mockDriver.getSuccessPayload(responses)).toEqual([
        responses[0].data,
        responses[1].data,
      ]);
    });
  });

  describe('getErrorPayload', () => {
    it('returns error', () => {
      const error = 'error';
      expect(mockDriver.getErrorPayload(error)).toBe(error);
    });
  });
});
