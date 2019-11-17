import getQuery from './get-query';

describe('selectors', () => {
  describe('getQuery', () => {
    const state = {
      network: {
        queries: {
          QUERY: { pending: 1, error: null, data: 'data', normalized: false },
          QUERY2: {
            pending: 0,
            error: null,
            data: ['@@1', '@@2'],
            normalized: true,
            usedKeys: { '': ['id', 'x'] },
          },
          QUERY3: {
            pending: 0,
            error: null,
            data: '@@3',
            normalized: true,
            usedKeys: {
              '': ['id', 'nested'],
              '.nested': ['id', 'list'],
              '.nested.list': ['id'],
            },
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
      },
    };

    it('returns fallback query state if not found', () => {
      expect(
        getQuery(
          { network: { queries: {}, mutations: {} } },
          { type: 'QUERY' },
        ),
      ).toEqual({
        data: null,
        loading: false,
        error: null,
      });
    });

    it('replaces data as null with [] when multiple true', () => {
      expect(
        getQuery(
          { network: { queries: {}, mutations: {} } },
          { type: 'QUERY', multiple: true },
        ),
      ).toEqual({
        data: [],
        loading: false,
        error: null,
      });
    });

    it('replaces data as custom object with {} when defaultData defined', () => {
      expect(
        getQuery(
          { network: { queries: {}, mutations: {} } },
          { type: 'QUERY', defaultData: {} },
        ),
      ).toEqual({
        data: {},
        loading: false,
        error: null,
      });
    });

    it('doesnt recompute when multiple is changed when data not empty', () => {
      expect(getQuery(state, { type: 'QUERY', multiple: true })).toBe(
        getQuery(state, { type: 'QUERY', multiple: false }),
      );
    });

    it('returns transformed query state if found', () => {
      expect(getQuery(state, { type: 'QUERY' })).toEqual({
        data: 'data',
        loading: true,
        error: null,
      });
    });

    it('memoizes queries', () => {
      const query = getQuery(state, { type: 'QUERY' });
      expect(query).toBe(getQuery(state, { type: 'QUERY' }));

      const query2 = getQuery({ ...state }, { type: 'QUERY2' });
      expect(query).not.toBe(query2);

      expect(query2).toBe(getQuery({ ...state }, { type: 'QUERY2' }));
      expect(query).toBe(getQuery({ ...state }, { type: 'QUERY' }));
    });

    it('denormalizes data if necessary', () => {
      expect(getQuery(state, { type: 'QUERY2' })).toEqual({
        data: [{ id: 1, x: 1 }, { id: 2, x: 2 }],
        loading: false,
        error: null,
      });
    });

    it('doesnt recompute on normalizedData update for not normalized query', () => {
      const query = getQuery(state, { type: 'QUERY' });
      const query2 = getQuery(
        { ...state, network: { ...state.network, normalizedData: {} } },
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
          network: {
            ...state.network,
            normalizedData: {
              ...state.network.normalizedData,
              '@@2': { id: 2, x: 3, y: 'a' },
            },
          },
        },
        { type: 'QUERY2' },
      );
      expect(query).toEqual({
        data: [{ id: 1, x: 1 }, { id: 2, x: 2 }],
        loading: false,
        error: null,
      });
      expect(query2).toEqual({
        data: [{ id: 1, x: 1 }, { id: 2, x: 3 }],
        loading: false,
        error: null,
      });
    });

    it('recomputes on nested dependency update for normalized query', () => {
      const query = getQuery(state, { type: 'QUERY3' });
      const query2 = getQuery(
        {
          ...state,
          network: {
            ...state.network,
            normalizedData: {
              ...state.network.normalizedData,
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
          network: {
            ...state.network,
            normalizedData: {
              ...state.network.normalizedData,
              '@@3': { id: 3, x: 4, y: 'a' },
            },
          },
        },
        { type: 'QUERY2' },
      );
      expect(query).toEqual({
        data: [{ id: 1, x: 1 }, { id: 2, x: 2 }],
        loading: false,
        error: null,
      });
      expect(query2).toBe(query);
    });
  });
});
