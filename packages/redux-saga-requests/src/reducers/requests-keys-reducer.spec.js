import requestsKeysReducer from './requests-keys-reducer';

describe('reducers', () => {
  describe('requestsKeysReducer', () => {
    const defaultState = { queries: {}, mutations: {}, requestsKeys: {} };

    it('doesnt do anything for not request actions', () => {
      expect(requestsKeysReducer(defaultState, { type: 'NOT_REQUEST' })).toBe(
        defaultState,
      );
    });

    it('appends requestKeys for request actions', () => {
      expect(
        requestsKeysReducer(defaultState, {
          type: 'REQUEST',
          request: { url: '/' },
          meta: { requestKey: '1' },
        }),
      ).toEqual({ ...defaultState, requestsKeys: { REQUEST: ['1'] } });
    });

    it('removes old requests when exceeding requestsCapacity', () => {
      expect(
        requestsKeysReducer(
          {
            ...defaultState,
            requestsKeys: { REQUEST: ['1'] },
            queries: {
              REQUEST1: { pending: 0, data: 'data', error: null },
              REQUEST2: { pending: 1, data: 'data', error: null },
            },
          },
          {
            type: 'REQUEST',
            request: { url: '/' },
            meta: { requestKey: '2', requestsCapacity: 1 },
          },
        ),
      ).toEqual({
        ...defaultState,
        requestsKeys: { REQUEST: ['2'] },
        queries: {
          REQUEST2: { pending: 1, data: 'data', error: null },
        },
      });

      expect(
        requestsKeysReducer(
          {
            ...defaultState,
            requestsKeys: { REQUEST: ['1'] },
            mutations: {
              REQUEST1: { pending: 0, error: null },
              REQUEST2: { pending: 1, error: null },
            },
          },
          {
            type: 'REQUEST',
            request: { url: '/' },
            meta: { requestKey: '2', requestsCapacity: 1, asMutation: true },
          },
        ),
      ).toEqual({
        ...defaultState,
        requestsKeys: { REQUEST: ['2'] },
        mutations: {
          REQUEST2: { pending: 1, error: null },
        },
      });
    });

    it('doesnt remove old requests when not exceeding requestsCapacity', () => {
      expect(
        requestsKeysReducer(
          {
            ...defaultState,
            requestsKeys: { REQUEST: ['1'] },
            queries: {
              REQUEST1: { pending: 0, data: 'data', error: null },
              REQUEST2: { pending: 0, data: 'data', error: null },
            },
          },
          {
            type: 'REQUEST',
            request: { url: '/' },
            meta: { requestKey: '2', requestsCapacity: 2 },
          },
        ),
      ).toEqual({
        ...defaultState,
        requestsKeys: { REQUEST: ['1', '2'] },
        queries: {
          REQUEST1: { pending: 0, data: 'data', error: null },
          REQUEST2: { pending: 0, data: 'data', error: null },
        },
      });
    });

    it('doesnt remove old pending requests even when exceeding requestsCapacity', () => {
      expect(
        requestsKeysReducer(
          {
            ...defaultState,
            requestsKeys: { REQUEST: ['1'] },
            queries: {
              REQUEST1: { pending: 1, data: 'data', error: null },
              REQUEST2: { pending: 0, data: 'data', error: null },
            },
          },
          {
            type: 'REQUEST',
            request: { url: '/' },
            meta: { requestKey: '2', requestsCapacity: 1 },
          },
        ),
      ).toEqual({
        ...defaultState,
        requestsKeys: { REQUEST: ['1', '2'] },
        queries: {
          REQUEST1: { pending: 1, data: 'data', error: null },
          REQUEST2: { pending: 0, data: 'data', error: null },
        },
      });
    });
  });
});
