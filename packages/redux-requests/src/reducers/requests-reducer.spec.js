import { createSuccessAction, createErrorAction } from '../actions';
import {
  createQuery,
  createMutation,
  createLocalMutation,
} from '../requests-creators';

import { requestsReducer } from '.';

describe('reducers', () => {
  describe('requestsReducer', () => {
    it('has initial state as empty object', () => {
      expect(requestsReducer()(undefined, {})).toEqual({
        queries: {},
        mutations: {},
        normalizedData: {},
        cache: {},
        requestsKeys: {},
        downloadProgress: {},
        uploadProgress: {},
        ssr: null,
        watchers: {},
        websocket: { pristine: true, connected: false },
      });
    });

    it('does not crash on non request action on load', () => {
      expect(
        requestsReducer()(
          {
            queries: {},
            mutations: {},
            normalizedData: {},
            cache: {},
            requestsKeys: {},
            downloadProgress: {},
            uploadProgress: {},
            ssr: null,
          },
          { type: 'NOT_REQUEST' },
        ),
      ).toEqual({
        queries: {},
        mutations: {},
        normalizedData: {},
        cache: {},
        requestsKeys: {},
        downloadProgress: {},
        uploadProgress: {},
        ssr: null,
      });
    });

    it('handles read only requests', () => {
      const reducer = requestsReducer();
      const firstRequest = createQuery('REQUEST', { url: '/' })();
      const secondRequest = createQuery('REQUEST_2', { url: '/' })();

      let state = reducer(
        {
          queries: {},
          mutations: {},
          normalizedData: {},
          cache: {},
          requestsKeys: {},
          downloadProgress: {},
          uploadProgress: {},
          ssr: null,
        },
        firstRequest,
      );
      expect(state.queries).toEqual({
        REQUEST: {
          data: null,
          pending: 1,
          error: null,
          pristine: false,
          normalized: false,
          usedKeys: null,
          dependencies: null,
          ref: {},
        },
      });

      state = reducer(state, secondRequest);
      expect(state.queries).toEqual({
        REQUEST: {
          data: null,
          pending: 1,
          error: null,
          pristine: false,
          normalized: false,
          usedKeys: null,
          dependencies: null,
          ref: {},
        },
        REQUEST_2: {
          data: null,
          pending: 1,
          error: null,
          pristine: false,
          normalized: false,
          usedKeys: null,
          dependencies: null,
          ref: {},
        },
      });

      state = reducer(
        state,
        createSuccessAction(firstRequest, { data: 'data' }),
      );
      expect(state.queries).toEqual({
        REQUEST: {
          data: 'data',
          pending: 0,
          error: null,
          pristine: false,
          normalized: false,
          usedKeys: null,
          dependencies: null,
          ref: {},
        },
        REQUEST_2: {
          data: null,
          pending: 1,
          error: null,
          pristine: false,
          normalized: false,
          usedKeys: null,
          dependencies: null,
          ref: {},
        },
      });

      state = reducer(state, createErrorAction(secondRequest, 'error'));
      expect(state.queries).toEqual({
        REQUEST: {
          data: 'data',
          pending: 0,
          error: null,
          pristine: false,
          normalized: false,
          usedKeys: null,
          dependencies: null,
          ref: {},
        },
        REQUEST_2: {
          data: null,
          pending: 0,
          error: 'error',
          pristine: false,
          normalized: false,
          usedKeys: null,
          dependencies: null,
          ref: {},
        },
      });
    });

    // it('allows to override config as argument', () => {
    //   const reducer = requestsReducer({
    //     getData: data => ({ nested: data }),
    //   });
    //   const state = reducer(
    //     { queries: {}, mutations: {} },
    //     { type: 'REQUEST', request: { url: '/' } },
    //   );

    //   expect(
    //     reducer(
    //       state,
    //       createSuccessAction(
    //         { type: 'REQUEST', request: { url: '/' } },
    //         { data: 'data' },
    //       ),
    //     ),
    //   ).toEqual({
    //     queries: {
    //       REQUEST: {
    //         data: { nested: 'data' },
    //         pending: 0,
    //         error: null,
    //       },
    //     },
    //     mutations: {},
    //   });
    // });

    it('supports mutations', () => {
      const reducer = requestsReducer();
      reducer(
        {
          queries: {},
          mutations: {},
          normalizedData: {},
          cache: {},
          requestsKeys: {},
          ssr: null,
        },
        createQuery('REQUEST', { url: '/' })(),
      );

      let state = {
        queries: {
          REQUEST: {
            data: null,
            pending: 0,
            error: null,
            pristine: false,
            normalized: false,
            usedKeys: null,
            dependencies: null,
            ref: {},
          },
        },
        normalizedData: {},
        mutations: {},
        cache: {},
        requestsKeys: {},
        ssr: null,
      };

      state = reducer(
        state,
        createLocalMutation('LOCAL_MUTATION', {
          mutations: {
            REQUEST: () => 'data',
          },
        })(),
      );

      expect(state).toEqual({
        queries: {
          REQUEST: {
            data: 'data',
            pending: 0,
            error: null,
            pristine: false,
            normalized: false,
            usedKeys: null,
            dependencies: null,
            ref: {},
          },
        },
        normalizedData: {},
        mutations: {},
        cache: {},
        requestsKeys: {},
        ssr: null,
      });

      const mutationWithoutConfig = createMutation('MUTATION_WITHOUT_CONFIG', {
        url: '/',
        method: 'post',
      })();

      state = reducer(state, mutationWithoutConfig);

      expect(state).toEqual({
        queries: {
          REQUEST: {
            data: 'data',
            pending: 0,
            error: null,
            pristine: false,
            normalized: false,
            usedKeys: null,
            dependencies: null,
            ref: {},
          },
        },
        mutations: {
          MUTATION_WITHOUT_CONFIG: {
            error: null,
            pending: 1,
            ref: {},
          },
        },
        normalizedData: {},
        cache: {},
        requestsKeys: {},
        ssr: null,
      });

      state = reducer(state, createErrorAction(mutationWithoutConfig, 'error'));

      expect(state).toEqual({
        queries: {
          REQUEST: {
            data: 'data',
            pending: 0,
            error: null,
            pristine: false,
            normalized: false,
            usedKeys: null,
            dependencies: null,
            ref: {},
          },
        },
        mutations: {
          MUTATION_WITHOUT_CONFIG: {
            error: 'error',
            pending: 0,
            ref: {},
          },
        },
        normalizedData: {},
        cache: {},
        requestsKeys: {},
        ssr: null,
      });

      state = reducer(state, mutationWithoutConfig);

      expect(state).toEqual({
        queries: {
          REQUEST: {
            data: 'data',
            pending: 0,
            error: null,
            pristine: false,
            normalized: false,
            usedKeys: null,
            dependencies: null,
            ref: {},
          },
        },
        mutations: {
          MUTATION_WITHOUT_CONFIG: {
            error: null,
            pending: 1,
            ref: {},
          },
        },
        normalizedData: {},
        cache: {},
        requestsKeys: {},
        ssr: null,
      });

      state = reducer(
        state,
        createSuccessAction(mutationWithoutConfig, { data: 'data' }),
      );

      expect(state).toEqual({
        queries: {
          REQUEST: {
            data: 'data',
            pending: 0,
            error: null,
            pristine: false,
            normalized: false,
            usedKeys: null,
            dependencies: null,
            ref: {},
          },
        },
        mutations: {
          MUTATION_WITHOUT_CONFIG: {
            error: null,
            pending: 0,
            ref: {},
          },
        },
        normalizedData: {},
        cache: {},
        requestsKeys: {},
        ssr: null,
      });

      const mutationWithConfig = createMutation(
        'MUTATION_WITH_CONFIG',
        { url: '/', method: 'post' },
        {
          mutations: {
            REQUEST: (_, data) => data,
          },
        },
      )();

      state = reducer(state, mutationWithConfig);

      expect(state).toEqual({
        queries: {
          REQUEST: {
            data: 'data',
            pending: 0,
            error: null,
            pristine: false,
            normalized: false,
            usedKeys: null,
            dependencies: null,
            ref: {},
          },
        },
        mutations: {
          MUTATION_WITHOUT_CONFIG: {
            error: null,
            pending: 0,
            ref: {},
          },
          MUTATION_WITH_CONFIG: {
            error: null,
            pending: 1,
            ref: {},
          },
        },
        cache: {},
        normalizedData: {},
        requestsKeys: {},
        ssr: null,
      });

      state = reducer(
        state,
        createSuccessAction(mutationWithConfig, { data: 'data2' }),
      );

      expect(state).toEqual({
        queries: {
          REQUEST: {
            data: 'data2',
            pending: 0,
            error: null,
            pristine: false,
            normalized: false,
            usedKeys: null,
            dependencies: null,
            ref: {},
          },
        },
        mutations: {
          MUTATION_WITHOUT_CONFIG: {
            error: null,
            pending: 0,
            ref: {},
          },
          MUTATION_WITH_CONFIG: {
            error: null,
            pending: 0,
            ref: {},
          },
        },
        cache: {},
        requestsKeys: {},
        normalizedData: {},
        ssr: null,
      });

      const mutationWithConfigWithRequestKey = createMutation(
        'MUTATION_WITH_CONFIG_WITH_REQUEST_KEY',
        { url: '/', method: 'post' },
        {
          requestKey: '1',
          mutations: {
            REQUEST: (_, data) => data,
          },
        },
      )();

      state = reducer(state, mutationWithConfigWithRequestKey);
      state = reducer(state, mutationWithConfigWithRequestKey);

      expect(state).toEqual({
        queries: {
          REQUEST: {
            data: 'data2',
            pending: 0,
            error: null,
            pristine: false,
            normalized: false,
            usedKeys: null,
            dependencies: null,
            ref: {},
          },
        },
        mutations: {
          MUTATION_WITHOUT_CONFIG: {
            error: null,
            pending: 0,
            ref: {},
          },
          MUTATION_WITH_CONFIG: {
            error: null,
            pending: 0,
            ref: {},
          },
          MUTATION_WITH_CONFIG_WITH_REQUEST_KEY1: {
            error: null,
            pending: 2,
            ref: {},
          },
        },
        cache: {},
        requestsKeys: {
          MUTATION_WITH_CONFIG_WITH_REQUEST_KEY: ['1'],
        },
        normalizedData: {},
        ssr: null,
      });

      state = reducer(
        state,
        createSuccessAction(mutationWithConfigWithRequestKey, {
          data: 'data3',
        }),
      );

      expect(state).toEqual({
        queries: {
          REQUEST: {
            data: 'data3',
            pending: 0,
            error: null,
            pristine: false,
            normalized: false,
            usedKeys: null,
            dependencies: null,
            ref: {},
          },
        },
        mutations: {
          MUTATION_WITHOUT_CONFIG: {
            error: null,
            pending: 0,
            ref: {},
          },
          MUTATION_WITH_CONFIG: {
            error: null,
            pending: 0,
            ref: {},
          },
          MUTATION_WITH_CONFIG_WITH_REQUEST_KEY1: {
            error: null,
            pending: 1,
            ref: {},
          },
        },
        cache: {},
        requestsKeys: {
          MUTATION_WITH_CONFIG_WITH_REQUEST_KEY: ['1'],
        },
        normalizedData: {},
        ssr: null,
      });

      state = reducer(
        state,
        createSuccessAction(mutationWithConfigWithRequestKey, {
          data: 'data3',
        }),
      );

      expect(state).toEqual({
        queries: {
          REQUEST: {
            data: 'data3',
            pending: 0,
            error: null,
            pristine: false,
            normalized: false,
            usedKeys: null,
            dependencies: null,
            ref: {},
          },
        },
        mutations: {
          MUTATION_WITHOUT_CONFIG: {
            error: null,
            pending: 0,
            ref: {},
          },
          MUTATION_WITH_CONFIG: {
            error: null,
            pending: 0,
            ref: {},
          },
          MUTATION_WITH_CONFIG_WITH_REQUEST_KEY1: {
            error: null,
            pending: 0,
            ref: {},
          },
        },
        cache: {},
        requestsKeys: {
          MUTATION_WITH_CONFIG_WITH_REQUEST_KEY: ['1'],
        },
        normalizedData: {},
        ssr: null,
      });

      const mutationWithOptimisticUpdate = createMutation(
        'MUTATION_WITH_OPTIMISTIC_UPDATE',
        { url: '/', method: 'post' },
        {
          mutations: {
            REQUEST: {
              updateData: (data, mutationData) => mutationData,
              updateDataOptimistic: () => 'optimistic data',
              revertData: () => 'reverted data',
            },
          },
        },
      )();

      state = reducer(state, mutationWithOptimisticUpdate);

      expect(state).toEqual({
        queries: {
          REQUEST: {
            data: 'optimistic data',
            pending: 0,
            error: null,
            pristine: false,
            normalized: false,
            usedKeys: null,
            dependencies: null,
            ref: {},
          },
        },
        mutations: {
          MUTATION_WITHOUT_CONFIG: {
            error: null,
            pending: 0,
            ref: {},
          },
          MUTATION_WITH_CONFIG: {
            error: null,
            pending: 0,
            ref: {},
          },
          MUTATION_WITH_CONFIG_WITH_REQUEST_KEY1: {
            error: null,
            pending: 0,
            ref: {},
          },
          MUTATION_WITH_OPTIMISTIC_UPDATE: {
            error: null,
            pending: 1,
            ref: {},
          },
        },
        cache: {},
        normalizedData: {},
        requestsKeys: {
          MUTATION_WITH_CONFIG_WITH_REQUEST_KEY: ['1'],
        },
        ssr: null,
      });

      state = reducer(
        state,
        createSuccessAction(mutationWithOptimisticUpdate, { data: 'data4' }),
      );

      expect(state).toEqual({
        queries: {
          REQUEST: {
            data: 'data4',
            pending: 0,
            error: null,
            pristine: false,
            normalized: false,
            usedKeys: null,
            dependencies: null,
            ref: {},
          },
        },
        mutations: {
          MUTATION_WITHOUT_CONFIG: {
            error: null,
            pending: 0,
            ref: {},
          },
          MUTATION_WITH_CONFIG: {
            error: null,
            pending: 0,
            ref: {},
          },
          MUTATION_WITH_CONFIG_WITH_REQUEST_KEY1: {
            error: null,
            pending: 0,
            ref: {},
          },
          MUTATION_WITH_OPTIMISTIC_UPDATE: {
            error: null,
            pending: 0,
            ref: {},
          },
        },
        cache: {},
        requestsKeys: {
          MUTATION_WITH_CONFIG_WITH_REQUEST_KEY: ['1'],
        },
        normalizedData: {},
        ssr: null,
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
            pristine: false,
            normalized: false,
            usedKeys: null,
            dependencies: null,
            ref: {},
          },
        },
        mutations: {
          MUTATION_WITHOUT_CONFIG: {
            error: null,
            pending: 0,
            ref: {},
          },
          MUTATION_WITH_CONFIG: {
            error: null,
            pending: 0,
            ref: {},
          },
          MUTATION_WITH_CONFIG_WITH_REQUEST_KEY1: {
            error: null,
            pending: 0,
            ref: {},
          },
          MUTATION_WITH_OPTIMISTIC_UPDATE: {
            error: 'error',
            pending: 0,
            ref: {},
          },
        },
        cache: {},
        normalizedData: {},
        requestsKeys: {
          MUTATION_WITH_CONFIG_WITH_REQUEST_KEY: ['1'],
        },
        ssr: null,
      });
    });

    it('supports SSR', () => {
      const reducer = requestsReducer();
      const initialState = {
        queries: {
          QUERY: {
            data: ['data'],
            pending: 0,
            error: null,
            pristine: false,
            normalized: false,
            usedKeys: null,
            dependencies: null,
            ref: {},
          },
        },
        mutations: {},
        cache: {},
        normalizedData: {},
        requestsKeys: {},
        ssr: null,
      };

      let state = reducer(initialState, {});
      expect(state).toEqual(initialState);

      state = reducer(
        state,
        createLocalMutation('LOCAL_MUTATION', {
          mutations: {
            QUERY: data => [...data, 'data2'],
          },
        })(),
      );
      expect(state).toEqual({
        queries: {
          QUERY: {
            data: ['data', 'data2'],
            pending: 0,
            error: null,
            pristine: false,
            normalized: false,
            usedKeys: null,
            dependencies: null,
            ref: {},
          },
        },
        mutations: {},
        cache: {},
        normalizedData: {},
        requestsKeys: {},
        ssr: null,
      });
    });
  });
});
