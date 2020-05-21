import { createDriver } from './mock-driver';

describe('mockDriver', () => {
  const mockInstance = {
    FETCH_LIST: () => ({ data: ['item1', 'item2'] }),
    FETCH_ERROR: () => {
      throw 'responseError';
    },
  };

  const mockDriver = createDriver(mockInstance);

  it('returns correct response', async () => {
    const response = await mockDriver({
      response: { data: ['item1', 'item2'] },
    });
    expect(response).toEqual({ data: ['item1', 'item2'] });
  });

  it('handles error response', async () => {
    await expect(mockDriver({ error: 'responseError' })).rejects.toBe(
      'responseError',
    );
  });
});
