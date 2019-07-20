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
          operations: null,
        },
      });

      state = reducer(state, secondRequest);
      expect(state.queries).toEqual({
        REQUEST: {
          data: null,
          pending: 1,
          error: null,
          operations: null,
        },
        REQUEST_2: {
          data: null,
          pending: 1,
          error: null,
          operations: null,
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
          operations: null,
        },
        REQUEST_2: {
          data: null,
          pending: 1,
          error: null,
          operations: null,
        },
      });

      state = reducer(state, createErrorAction(secondRequest, 'error'));
      expect(state.queries).toEqual({
        REQUEST: {
          data: 'data',
          pending: 0,
          error: null,
          operations: null,
        },
        REQUEST_2: {
          data: null,
          pending: 0,
          error: 'error',
          operations: null,
        },
      });
    });

    it('allows to override config as argument', () => {
      const reducer = networkReducer({ multiple: true });

      expect(
        reducer(
          { queries: {}, mutations: {} },
          { type: 'REQUEST', request: { url: '/' } },
        ),
      ).toEqual({
        queries: {
          REQUEST: {
            data: [],
            pending: 1,
            error: null,
            operations: null,
          },
        },
        mutations: {},
      });
    });

    it('allows to override config with action meta', () => {
      const reducer = networkReducer();

      expect(
        reducer(
          { queries: {}, mutations: {} },
          { type: 'REQUEST', request: { url: '/' }, meta: { multiple: true } },
        ),
      ).toEqual({
        queries: {
          REQUEST: {
            data: [],
            pending: 1,
            error: null,
            operations: null,
          },
        },
        mutations: {},
      });
    });

    it('supports operations', () => {
      const reducer = networkReducer();
      reducer(
        { queries: {}, operations: {} },
        { type: 'REQUEST', request: { url: '/' } },
      );

      let state = {
        queries: {
          REQUEST: {
            data: null,
            pending: 0,
            error: null,
            operations: null,
          },
        },
        mutations: {},
      };

      state = reducer(state, {
        type: 'LOCAL_OPERATION',
        data: 'data',
        meta: {
          operations: {
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
            operations: null,
          },
        },
        mutations: {},
      });

      const operationWithoutConfig = {
        type: 'OPERATION_WITHOUT_CONFIG',
        request: { url: '/', method: 'post' },
      };

      state = reducer(state, operationWithoutConfig);

      expect(state).toEqual({
        queries: {
          REQUEST: {
            data: 'data',
            pending: 0,
            error: null,
            operations: null,
          },
        },
        mutations: {
          OPERATION_WITHOUT_CONFIG: {
            error: null,
            pending: 1,
          },
        },
      });

      state = reducer(
        state,
        createErrorAction(operationWithoutConfig, 'error'),
      );

      expect(state).toEqual({
        queries: {
          REQUEST: {
            data: 'data',
            pending: 0,
            error: null,
            operations: null,
          },
        },
        mutations: {
          OPERATION_WITHOUT_CONFIG: {
            error: 'error',
            pending: 0,
          },
        },
      });

      state = reducer(state, operationWithoutConfig);

      expect(state).toEqual({
        queries: {
          REQUEST: {
            data: 'data',
            pending: 0,
            error: null,
            operations: null,
          },
        },
        mutations: {
          OPERATION_WITHOUT_CONFIG: {
            error: null,
            pending: 1,
          },
        },
      });

      state = reducer(
        state,
        createSuccessAction(operationWithoutConfig, 'data'),
      );

      expect(state).toEqual({
        queries: {
          REQUEST: {
            data: 'data',
            pending: 0,
            error: null,
            operations: null,
          },
        },
        mutations: {
          OPERATION_WITHOUT_CONFIG: {
            error: null,
            pending: 0,
          },
        },
      });

      const operationWithConfig = {
        type: 'OPERATION_WITH_CONFIG',
        request: { url: '/', method: 'post' },
        meta: {
          operations: {
            REQUEST: (_, action) => action.data,
          },
        },
      };

      state = reducer(state, operationWithConfig);

      expect(state).toEqual({
        queries: {
          REQUEST: {
            data: 'data',
            pending: 0,
            error: null,
            operations: null,
          },
        },
        mutations: {
          OPERATION_WITHOUT_CONFIG: {
            error: null,
            pending: 0,
          },
          OPERATION_WITH_CONFIG: {
            error: null,
            pending: 1,
          },
        },
      });

      state = reducer(state, createSuccessAction(operationWithConfig, 'data2'));

      expect(state).toEqual({
        queries: {
          REQUEST: {
            data: 'data2',
            pending: 0,
            error: null,
            operations: null,
          },
        },
        mutations: {
          OPERATION_WITHOUT_CONFIG: {
            error: null,
            pending: 0,
          },
          OPERATION_WITH_CONFIG: {
            error: null,
            pending: 0,
          },
        },
      });

      const operationWithConfigWithRequestKey = {
        type: 'OPERATION_WITH_CONFIG_WITH_REQUEST_KEY',
        request: { url: '/', method: 'post' },
        meta: {
          id: '1',
          operations: {
            getRequestKey: action => action.meta.id,
            REQUEST: (_, action) => action.data,
          },
        },
      };

      state = reducer(state, operationWithConfigWithRequestKey);

      expect(state).toEqual({
        queries: {
          REQUEST: {
            data: 'data2',
            pending: 0,
            error: null,
            operations: null,
          },
        },
        mutations: {
          OPERATION_WITHOUT_CONFIG: {
            error: null,
            pending: 0,
          },
          OPERATION_WITH_CONFIG: {
            error: null,
            pending: 0,
          },
          OPERATION_WITH_CONFIG_WITH_REQUEST_KEY: {
            1: {
              error: null,
              pending: 1,
            },
          },
        },
      });

      state = reducer(
        state,
        createSuccessAction(operationWithConfigWithRequestKey, 'data3'),
      );

      expect(state).toEqual({
        queries: {
          REQUEST: {
            data: 'data3',
            pending: 0,
            error: null,
            operations: null,
          },
        },
        mutations: {
          OPERATION_WITHOUT_CONFIG: {
            error: null,
            pending: 0,
          },
          OPERATION_WITH_CONFIG: {
            error: null,
            pending: 0,
          },
          OPERATION_WITH_CONFIG_WITH_REQUEST_KEY: {},
        },
      });

      const operationWithOptimisticUpdate = {
        type: 'OPERATION_WITH_OPTIMISTIC_UPDATE',
        request: { url: '/', method: 'post' },
        data: 'optimistic data',
        meta: {
          operations: {
            REQUEST: {
              updateData: (_, action) => action.data,
              updateDataOptimistic: (_, action) => action.data,
              revertData: () => 'reverted data',
            },
          },
        },
      };

      state = reducer(state, operationWithOptimisticUpdate);

      expect(state).toEqual({
        queries: {
          REQUEST: {
            data: 'optimistic data',
            pending: 0,
            error: null,
            operations: null,
          },
        },
        mutations: {
          OPERATION_WITHOUT_CONFIG: {
            error: null,
            pending: 0,
          },
          OPERATION_WITH_CONFIG: {
            error: null,
            pending: 0,
          },
          OPERATION_WITH_CONFIG_WITH_REQUEST_KEY: {},
          OPERATION_WITH_OPTIMISTIC_UPDATE: {
            error: null,
            pending: 1,
          },
        },
      });

      state = reducer(
        state,
        createSuccessAction(operationWithOptimisticUpdate, 'data4'),
      );

      expect(state).toEqual({
        queries: {
          REQUEST: {
            data: 'data4',
            pending: 0,
            error: null,
            operations: null,
          },
        },
        mutations: {
          OPERATION_WITHOUT_CONFIG: {
            error: null,
            pending: 0,
          },
          OPERATION_WITH_CONFIG: {
            error: null,
            pending: 0,
          },
          OPERATION_WITH_CONFIG_WITH_REQUEST_KEY: {},
          OPERATION_WITH_OPTIMISTIC_UPDATE: {
            error: null,
            pending: 0,
          },
        },
      });

      state = reducer(state, operationWithOptimisticUpdate);

      state = reducer(
        state,
        createErrorAction(operationWithOptimisticUpdate, 'error'),
      );

      expect(state).toEqual({
        queries: {
          REQUEST: {
            data: 'reverted data',
            pending: 0,
            error: null,
            operations: null,
          },
        },
        mutations: {
          OPERATION_WITHOUT_CONFIG: {
            error: null,
            pending: 0,
          },
          OPERATION_WITH_CONFIG: {
            error: null,
            pending: 0,
          },
          OPERATION_WITH_CONFIG_WITH_REQUEST_KEY: {},
          OPERATION_WITH_OPTIMISTIC_UPDATE: {
            error: 'error',
            pending: 0,
          },
        },
      });
    });
  });
});
