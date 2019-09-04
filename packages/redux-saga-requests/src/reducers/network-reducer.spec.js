import { createSuccessAction, createErrorAction } from '../actions';
import { networkReducer } from '.';

describe('reducers', () => {
  describe('networkReducer', () => {
    it('has initial state as empty object', () => {
      expect(networkReducer()(undefined, {})).toEqual({
        queries: {},
        mutations: {},
      });
    });

    it('does not crash on non request action on load', () => {
      expect(
        networkReducer()(
          { queries: {}, mutations: {} },
          { type: 'NOT_REQUEST' },
        ),
      ).toEqual({ queries: {}, mutations: {} });
    });

    it('handles read only requests', () => {
      const reducer = networkReducer();
      const firstRequest = { type: 'REQUEST', request: { url: '/' } };
      const secondRequest = { type: 'REQUEST_2', request: { url: '/' } };

      let state = reducer({ queries: {}, mutations: {} }, firstRequest);
      expect(state.queries).toEqual({
        REQUEST: {
          data: null,
          pending: 1,
          error: null,
        },
      });

      state = reducer(state, secondRequest);
      expect(state.queries).toEqual({
        REQUEST: {
          data: null,
          pending: 1,
          error: null,
        },
        REQUEST_2: {
          data: null,
          pending: 1,
          error: null,
        },
      });

      state = reducer(
        state,
        createSuccessAction(firstRequest, 'data', { data: 'data' }),
      );
      expect(state.queries).toEqual({
        REQUEST: {
          data: 'data',
          pending: 0,
          error: null,
        },
        REQUEST_2: {
          data: null,
          pending: 1,
          error: null,
        },
      });

      state = reducer(state, createErrorAction(secondRequest, 'error'));
      expect(state.queries).toEqual({
        REQUEST: {
          data: 'data',
          pending: 0,
          error: null,
        },
        REQUEST_2: {
          data: null,
          pending: 0,
          error: 'error',
        },
      });
    });

    it('allows to override config as argument', () => {
      const reducer = networkReducer({
        getData: (state, action) => ({ nested: action.data }),
      });
      const state = reducer(
        { queries: {}, mutations: {} },
        { type: 'REQUEST', request: { url: '/' } },
      );

      expect(
        reducer(
          state,
          createSuccessAction(
            { type: 'REQUEST', request: { url: '/' } },
            'data',
          ),
        ),
      ).toEqual({
        queries: {
          REQUEST: {
            data: { nested: 'data' },
            pending: 0,
            error: null,
          },
        },
        mutations: {},
      });
    });

    it('allows to override config with action meta', () => {
      const reducer = networkReducer();
      const requestAction = {
        type: 'REQUEST',
        request: { url: '/' },
        meta: { getData: (state, action) => ({ nested: action.data }) },
      };
      const state = reducer({ queries: {}, mutations: {} }, requestAction);

      expect(
        reducer(state, createSuccessAction(requestAction, 'data')),
      ).toEqual({
        queries: {
          REQUEST: {
            data: { nested: 'data' },
            pending: 0,
            error: null,
          },
        },
        mutations: {},
      });
    });

    it('supports mutations', () => {
      const reducer = networkReducer();
      reducer(
        { queries: {}, mutations: {} },
        { type: 'REQUEST', request: { url: '/' } },
      );

      let state = {
        queries: {
          REQUEST: {
            data: null,
            pending: 0,
            error: null,
          },
        },
        mutations: {},
      };

      state = reducer(state, {
        type: 'LOCAL_MUTATION',
        data: 'data',
        meta: {
          mutations: {
            REQUEST: {
              local: true,
              updateData: (_, action) => action.data,
            },
          },
        },
      });

      expect(state).toEqual({
        queries: {
          REQUEST: {
            data: 'data',
            pending: 0,
            error: null,
          },
        },
        mutations: {},
      });

      const mutationWithoutConfig = {
        type: 'MUTATION_WITHOUT_CONFIG',
        request: { url: '/', method: 'post' },
      };

      state = reducer(state, mutationWithoutConfig);

      expect(state).toEqual({
        queries: {
          REQUEST: {
            data: 'data',
            pending: 0,
            error: null,
          },
        },
        mutations: {
          MUTATION_WITHOUT_CONFIG: {
            error: null,
            pending: 1,
          },
        },
      });

      state = reducer(state, createErrorAction(mutationWithoutConfig, 'error'));

      expect(state).toEqual({
        queries: {
          REQUEST: {
            data: 'data',
            pending: 0,
            error: null,
          },
        },
        mutations: {
          MUTATION_WITHOUT_CONFIG: {
            error: 'error',
            pending: 0,
          },
        },
      });

      state = reducer(state, mutationWithoutConfig);

      expect(state).toEqual({
        queries: {
          REQUEST: {
            data: 'data',
            pending: 0,
            error: null,
          },
        },
        mutations: {
          MUTATION_WITHOUT_CONFIG: {
            error: null,
            pending: 1,
          },
        },
      });

      state = reducer(
        state,
        createSuccessAction(mutationWithoutConfig, 'data'),
      );

      expect(state).toEqual({
        queries: {
          REQUEST: {
            data: 'data',
            pending: 0,
            error: null,
          },
        },
        mutations: {
          MUTATION_WITHOUT_CONFIG: {
            error: null,
            pending: 0,
          },
        },
      });

      const mutationWithConfig = {
        type: 'MUTATION_WITH_CONFIG',
        request: { url: '/', method: 'post' },
        meta: {
          mutations: {
            REQUEST: (_, action) => action.data,
          },
        },
      };

      state = reducer(state, mutationWithConfig);

      expect(state).toEqual({
        queries: {
          REQUEST: {
            data: 'data',
            pending: 0,
            error: null,
          },
        },
        mutations: {
          MUTATION_WITHOUT_CONFIG: {
            error: null,
            pending: 0,
          },
          MUTATION_WITH_CONFIG: {
            error: null,
            pending: 1,
          },
        },
      });

      state = reducer(state, createSuccessAction(mutationWithConfig, 'data2'));

      expect(state).toEqual({
        queries: {
          REQUEST: {
            data: 'data2',
            pending: 0,
            error: null,
          },
        },
        mutations: {
          MUTATION_WITHOUT_CONFIG: {
            error: null,
            pending: 0,
          },
          MUTATION_WITH_CONFIG: {
            error: null,
            pending: 0,
          },
        },
      });

      const mutationWithConfigWithRequestKey = {
        type: 'MUTATION_WITH_CONFIG_WITH_REQUEST_KEY',
        request: { url: '/', method: 'post' },
        meta: {
          id: '1',
          mutations: {
            getRequestKey: action => action.meta.id,
            REQUEST: (_, action) => action.data,
          },
        },
      };

      state = reducer(state, mutationWithConfigWithRequestKey);
      state = reducer(state, mutationWithConfigWithRequestKey);

      expect(state).toEqual({
        queries: {
          REQUEST: {
            data: 'data2',
            pending: 0,
            error: null,
          },
        },
        mutations: {
          MUTATION_WITHOUT_CONFIG: {
            error: null,
            pending: 0,
          },
          MUTATION_WITH_CONFIG: {
            error: null,
            pending: 0,
          },
          MUTATION_WITH_CONFIG_WITH_REQUEST_KEY: {
            1: {
              error: null,
              pending: 2,
            },
          },
        },
      });

      state = reducer(
        state,
        createSuccessAction(mutationWithConfigWithRequestKey, 'data3'),
      );

      expect(state).toEqual({
        queries: {
          REQUEST: {
            data: 'data3',
            pending: 0,
            error: null,
          },
        },
        mutations: {
          MUTATION_WITHOUT_CONFIG: {
            error: null,
            pending: 0,
          },
          MUTATION_WITH_CONFIG: {
            error: null,
            pending: 0,
          },
          MUTATION_WITH_CONFIG_WITH_REQUEST_KEY: {
            1: {
              error: null,
              pending: 1,
            },
          },
        },
      });

      state = reducer(
        state,
        createSuccessAction(mutationWithConfigWithRequestKey, 'data3'),
      );

      expect(state).toEqual({
        queries: {
          REQUEST: {
            data: 'data3',
            pending: 0,
            error: null,
          },
        },
        mutations: {
          MUTATION_WITHOUT_CONFIG: {
            error: null,
            pending: 0,
          },
          MUTATION_WITH_CONFIG: {
            error: null,
            pending: 0,
          },
          MUTATION_WITH_CONFIG_WITH_REQUEST_KEY: {},
        },
      });

      const mutationWithOptimisticUpdate = {
        type: 'MUTATION_WITH_OPTIMISTIC_UPDATE',
        request: { url: '/', method: 'post' },
        data: 'optimistic data',
        meta: {
          mutations: {
            REQUEST: {
              updateData: (_, action) => action.data,
              updateDataOptimistic: (_, action) => action.data,
              revertData: () => 'reverted data',
            },
          },
        },
      };

      state = reducer(state, mutationWithOptimisticUpdate);

      expect(state).toEqual({
        queries: {
          REQUEST: {
            data: 'optimistic data',
            pending: 0,
            error: null,
          },
        },
        mutations: {
          MUTATION_WITHOUT_CONFIG: {
            error: null,
            pending: 0,
          },
          MUTATION_WITH_CONFIG: {
            error: null,
            pending: 0,
          },
          MUTATION_WITH_CONFIG_WITH_REQUEST_KEY: {},
          MUTATION_WITH_OPTIMISTIC_UPDATE: {
            error: null,
            pending: 1,
          },
        },
      });

      state = reducer(
        state,
        createSuccessAction(mutationWithOptimisticUpdate, 'data4'),
      );

      expect(state).toEqual({
        queries: {
          REQUEST: {
            data: 'data4',
            pending: 0,
            error: null,
          },
        },
        mutations: {
          MUTATION_WITHOUT_CONFIG: {
            error: null,
            pending: 0,
          },
          MUTATION_WITH_CONFIG: {
            error: null,
            pending: 0,
          },
          MUTATION_WITH_CONFIG_WITH_REQUEST_KEY: {},
          MUTATION_WITH_OPTIMISTIC_UPDATE: {
            error: null,
            pending: 0,
          },
        },
      });

      state = reducer(state, mutationWithOptimisticUpdate);

      state = reducer(
        state,
        createErrorAction(mutationWithOptimisticUpdate, 'error'),
      );

      expect(state).toEqual({
        queries: {
          REQUEST: {
            data: 'reverted data',
            pending: 0,
            error: null,
          },
        },
        mutations: {
          MUTATION_WITHOUT_CONFIG: {
            error: null,
            pending: 0,
          },
          MUTATION_WITH_CONFIG: {
            error: null,
            pending: 0,
          },
          MUTATION_WITH_CONFIG_WITH_REQUEST_KEY: {},
          MUTATION_WITH_OPTIMISTIC_UPDATE: {
            error: 'error',
            pending: 0,
          },
        },
      });
    });

    it('supports SSR', () => {
      const reducer = networkReducer();
      const initialState = {
        queries: {
          QUERY: {
            data: ['data'],
            pending: 0,
            error: null,
          },
        },
        mutations: {},
      };

      let state = reducer(initialState, {});
      expect(state).toEqual(initialState);

      state = reducer(state, {
        type: 'LOCAL_MUTATION',
        data: 'data2',
        meta: {
          mutations: {
            QUERY: {
              updateData: (queryState, action) => [
                ...queryState.data,
                action.data,
              ],
              local: true,
            },
          },
        },
      });
      expect(state).toEqual({
        queries: {
          QUERY: {
            data: ['data', 'data2'],
            pending: 0,
            error: null,
          },
        },
        mutations: {},
      });

      const query = {
        type: 'QUERY',
        request: {
          url: '/',
        },
        meta: {
          getData: (queryState, action) => [...queryState.data, action.data],
        },
      };
      state = reducer(state, query);
      state = reducer(state, createSuccessAction(query, 'data3'));
      expect(state).toEqual({
        queries: {
          QUERY: {
            data: ['data', 'data2', 'data3'],
            pending: 0,
            error: null,
          },
        },
        mutations: {},
      });
    });
  });
});
