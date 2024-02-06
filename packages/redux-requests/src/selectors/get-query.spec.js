import getQuery from './get-query';

describe('selectors', () => {
  describe('getQuery', () => {
    const state = {
      requests: {
        queries: {
          QUERY: {
            pending: 1,
            error: null,
            data: 'data',
            pristine: false,
            normalized: false,
            ref: {},
          },
          QUERY2: {
            pending: 0,
            error: null,
            data: ['@@1', '@@2'],
            pristine: false,
            normalized: true,
            usedKeys: { '': ['id', 'x'] },
            ref: {},
          },
          QUERY3: {
            pending: 0,
            error: null,
            data: '@@3',
            pristine: false,
            normalized: true,
            usedKeys: {
              '': ['id', 'nested'],
              '.nested': ['id', 'list'],
              '.nested.list': ['id'],
            },
            ref: {},
          },
          QUERY11: {
            pending: 1,
            error: null,
            data: 'data2',
            pristine: false,
            normalized: false,
            ref: {},
          },
          QUERY12: {
            pending: 1,
            error: null,
            data: 'data3',
            pristine: false,
            normalized: false,
            ref: {},
          },
        },
        mutations: {},
        normalizedData: {
          '@@1': { id: 1, x: 1, y: 'a' },
          '@@2': { id: 2, x: 2, y: 'a' },
          '@@3': { id: 3, nested: '@@4' },
          '@@4': { id: 4, list: ['@@5'] },
          '@@5': { id: 5 },
        },
        downloadProgress: {},
        uploadProgress: {},
      },
    };

    it('returns fallback query state if not found', () => {
      expect(
        getQuery(
          {
            requests: {
              queries: {},
              mutations: {},
              downloadProgress: {},
              uploadProgress: {},
            },
          },
          { type: 'QUERY' },
        ),
      ).toEqual({
        data: null,
        pending: 0,
        loading: false,
        error: null,
        pristine: true,
        downloadProgress: null,
        uploadProgress: null,
      });
    });

    it('returns transformed query state if found', () => {
      expect(getQuery(state, { type: 'QUERY' })).toEqual({
        data: 'data',
        pending: 1,
        loading: true,
        error: null,
        pristine: false,
        downloadProgress: null,
        uploadProgress: null,
      });
    });

    it('works with query requestKey', () => {
      expect(getQuery(state, { type: 'QUERY', requestKey: '11' })).toEqual({
        data: 'data2',
        pending: 1,
        loading: true,
        error: null,
        pristine: false,
        downloadProgress: null,
        uploadProgress: null,
      });
    });

    it('memoizes queries', () => {
      const query = getQuery(state, { type: 'QUERY' });
      expect(query).toBe(getQuery(state, { type: 'QUERY' }));

      const query11 = getQuery(state, { type: 'QUERY', requestKey: '11' });
      expect(query).not.toBe(query11);
      expect(query11).toBe(
        getQuery(state, { type: 'QUERY', requestKey: '11' }),
      );
      expect(query11).not.toBe(
        getQuery(state, { type: 'QUERY', requestKey: '12' }),
      );

      expect(query).toBe(getQuery(state, { type: 'QUERY' }));

      const query2 = getQuery({ ...state }, { type: 'QUERY2' });
      expect(query).not.toBe(query2);

      expect(query2).toBe(getQuery({ ...state }, { type: 'QUERY2' }));
      expect(query).toBe(getQuery({ ...state }, { type: 'QUERY' }));
    });

    it('denormalizes data if necessary', () => {
      expect(getQuery(state, { type: 'QUERY2' })).toEqual({
        data: [
          { id: 1, x: 1 },
          { id: 2, x: 2 },
        ],
        pending: 0,
        loading: false,
        error: null,
        pristine: false,
        downloadProgress: null,
        uploadProgress: null,
      });
    });

    it('doesnt recompute on normalizedData update for not normalized query', () => {
      const query = getQuery(state, { type: 'QUERY' });
      const query2 = getQuery(
        { ...state, requests: { ...state.requests, normalizedData: {} } },
        { type: 'QUERY' },
      );
      expect(query).toBe(query2);
    });

    it('doesnt recompute for normalized query when normalizedData is not changed', () => {
      const query = getQuery(state, { type: 'QUERY2' });
      const query2 = getQuery({ ...state }, { type: 'QUERY2' });
      const query3 = getQuery({ ...state }, { type: 'QUERY2' });
      expect(query).toBe(query2);
      expect(query).toBe(query3);
    });

    it('recomputes on relevant normalizedData update for normalized query', () => {
      const query = getQuery(state, { type: 'QUERY2' });
      const query2 = getQuery(
        {
          ...state,
          requests: {
            ...state.requests,
            normalizedData: {
              ...state.requests.normalizedData,
              '@@2': { id: 2, x: 3, y: 'a' },
            },
          },
        },
        { type: 'QUERY2' },
      );
      expect(query).toEqual({
        data: [
          { id: 1, x: 1 },
          { id: 2, x: 2 },
        ],
        pending: 0,
        loading: false,
        error: null,
        pristine: false,
        downloadProgress: null,
        uploadProgress: null,
      });
      expect(query2).toEqual({
        data: [
          { id: 1, x: 1 },
          { id: 2, x: 3 },
        ],
        pending: 0,
        loading: false,
        error: null,
        pristine: false,
        downloadProgress: null,
        uploadProgress: null,
      });
    });

    it('recomputes on nested dependency update for normalized query', () => {
      const query = getQuery(state, { type: 'QUERY3' });
      const query2 = getQuery(
        {
          ...state,
          requests: {
            ...state.requests,
            normalizedData: {
              ...state.requests.normalizedData,
              '@@4': { id: 4, list: ['@@5', '@@6'] },
              '@@5': { id: 5 },
              '@@6': { id: 6 },
            },
          },
        },
        { type: 'QUERY3' },
      );
      expect(query).not.toEqual(query2);
    });

    it('doesnt recompute on irrelevant normalizedData update for normalized query', () => {
      const query = getQuery(state, { type: 'QUERY2' });
      const query2 = getQuery(
        {
          ...state,
          requests: {
            ...state.requests,
            normalizedData: {
              ...state.requests.normalizedData,
              '@@3': { id: 3, x: 4, y: 'a' },
            },
          },
        },
        { type: 'QUERY2' },
      );
      expect(query).toEqual({
        data: [
          { id: 1, x: 1 },
          { id: 2, x: 2 },
        ],
        pending: 0,
        loading: false,
        error: null,
        pristine: false,
        downloadProgress: null,
        uploadProgress: null,
      });
      expect(query2).toBe(query);
    });
  });
});
