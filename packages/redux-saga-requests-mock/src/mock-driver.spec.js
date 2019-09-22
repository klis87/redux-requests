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

  it('returns correct response', async () => {
    const response = await mockDriver(
      { url: '/' },
      {
        type: 'FETCH_LIST',
        request: { url: '/' },
      },
    );
    expect(response).toEqual({ data: ['item1', 'item2'] });
  });

  it('returns correct dynamic response based on request action params', async () => {
    const requestConfig = {
      url: '/',
      body: { id: 1 },
    };
    const response = await mockDriver(requestConfig, {
      type: 'FETCH_DETAIL',
      request: requestConfig,
    });
    expect(response).toEqual({ data: { id: 1, type: 'FETCH_DETAIL' } });
  });

  it('handles error response', async () => {
    let error;

    try {
      await mockDriver(
        { url: '/' },
        {
          type: 'FETCH_ERROR',
          request: { url: '/' },
        },
      );
    } catch (e) {
      error = e;
    }
    expect(error).toBe('responseError');
  });
});
