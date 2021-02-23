import defaultConfig from '../default-config';
import {
  createSuccessAction,
  createErrorAction,
  createAbortAction,
} from '../actions';

import queriesReducer from './queries-reducer';

describe('reducers', () => {
  describe('queriesReducer', () => {
    describe('simple', () => {
      const defaultState = {
        data: null,
        error: null,
        pending: 0,
        pristine: true,
        normalized: false,
        ref: {},
        usedKeys: null,
      };
      const requestAction = {
        type: 'FETCH_BOOK',
        request: { url: '/ ' },
      };

      it('returns the same state for not handled action', () => {
        const state = { queries: {}, normalizedData: {} };
        expect(queriesReducer(state, { type: 'STH ' }, defaultConfig)).toBe(
          state,
        );
      });

      it('handles request query action', () => {
        expect(
          queriesReducer(
            { queries: {}, normalizedData: {} },
            requestAction,
            defaultConfig,
          ),
        ).toEqual({
          queries: {
            FETCH_BOOK: {
              ...defaultState,
              pending: 1,
              pristine: false,
            },
          },
          normalizedData: {},
        });
      });

      it('handles success query action', () => {
        expect(
          queriesReducer(
            { queries: {}, normalizedData: {} },
            createSuccessAction(requestAction, { data: 'data' }),
            defaultConfig,
          ),
        ).toEqual({
          queries: {
            FETCH_BOOK: {
              ...defaultState,
              pending: -1,
              data: 'data',
            },
          },
          normalizedData: {},
        });
      });

      it('handles error query action', () => {
        expect(
          queriesReducer(
            { queries: {}, normalizedData: {} },
            createErrorAction(requestAction, 'error'),
            defaultConfig,
          ),
        ).toEqual({
          queries: {
            FETCH_BOOK: {
              ...defaultState,
              pending: -1,
              error: 'error',
            },
          },
          normalizedData: {},
        });
      });

      it('handles abort query action', () => {
        expect(
          queriesReducer(
            { queries: {}, normalizedData: {} },
            createAbortAction(requestAction),
            defaultConfig,
          ),
        ).toEqual({
          queries: {
            FETCH_BOOK: {
              ...defaultState,
              pending: -1,
            },
          },
          normalizedData: {},
        });
      });
    });

    describe('with requestKey', () => {
      const defaultState = {
        data: null,
        error: null,
        pending: 0,
        pristine: true,
        normalized: false,
        ref: {},
        usedKeys: null,
      };
      const requestAction = {
        type: 'FETCH_BOOK',
        request: { url: '/ ' },
        meta: {
          requestKey: 1,
        },
      };

      it('handles request query action', () => {
        expect(
          queriesReducer(
            { queries: {}, normalizedData: {} },
            requestAction,
            defaultConfig,
          ),
        ).toEqual({
          queries: {
            FETCH_BOOK1: {
              ...defaultState,
              pending: 1,
              pristine: false,
            },
          },
          normalizedData: {},
        });
      });

      it('handles success query action', () => {
        expect(
          queriesReducer(
            { queries: {}, normalizedData: {} },
            createSuccessAction(requestAction, { data: 'data' }),
            defaultConfig,
          ),
        ).toEqual({
          queries: {
            FETCH_BOOK1: {
              ...defaultState,
              pending: -1,
              data: 'data',
            },
          },
          normalizedData: {},
        });
      });

      it('handles error query action', () => {
        expect(
          queriesReducer(
            { queries: {}, normalizedData: {} },
            createErrorAction(requestAction, 'error'),
            defaultConfig,
          ),
        ).toEqual({
          queries: {
            FETCH_BOOK1: {
              ...defaultState,
              pending: -1,
              error: 'error',
            },
          },
          normalizedData: {},
        });
      });

      it('handles abort query action', () => {
        expect(
          queriesReducer(
            { queries: {}, normalizedData: {} },
            createAbortAction(requestAction),
            defaultConfig,
          ),
        ).toEqual({
          queries: {
            FETCH_BOOK1: {
              ...defaultState,
              pending: -1,
            },
          },
          normalizedData: {},
        });
      });
    });

    describe('with mutations', () => {
      const initialState = {
        queries: {
          FETCH_BOOK: {
            data: 'data',
            error: null,
            pending: 0,
            pristine: false,
            normalized: false,
          },
        },
        normalizedData: {},
      };

      const MUTATION_ACTION = 'MUTATION_ACTION';

      it('can update data optimistic', () => {
        expect(
          queriesReducer(
            initialState,
            {
              type: MUTATION_ACTION,
              request: { url: '/books', method: 'post' },
              meta: {
                mutations: {
                  FETCH_BOOK: {
                    updateDataOptimistic: data => `${data} suffix`,
                  },
                },
              },
            },
            defaultConfig,
          ),
        ).toEqual({
          queries: {
            FETCH_BOOK: {
              data: 'data suffix',
              error: null,
              pending: 0,
              pristine: false,
              normalized: false,
            },
          },
          normalizedData: {},
        });
      });

      it('keeps data updated optimistic on mutation success if updateData undefined', () => {
        expect(
          queriesReducer(
            initialState,
            createSuccessAction(
              {
                type: MUTATION_ACTION,
                request: { url: '/books', method: 'post' },
                meta: {
                  mutations: {
                    FETCH_BOOK: {
                      updateDataOptimistic: data => `${data} suffix`,
                    },
                  },
                },
              },
              { data: 'updated data' },
            ),
            defaultConfig,
          ),
        ).toEqual(initialState);
      });

      it('handles updateData customized per mutation', () => {
        expect(
          queriesReducer(
            initialState,
            createSuccessAction(
              {
                type: MUTATION_ACTION,
                request: { url: '/books', method: 'post' },
                meta: {
                  mutations: {
                    FETCH_BOOK: (data, mutationData) =>
                      data + mutationData.nested,
                  },
                },
              },
              { data: { nested: 'suffix' } },
            ),
            defaultConfig,
          ),
        ).toEqual({
          queries: {
            FETCH_BOOK: {
              data: 'datasuffix',
              error: null,
              pending: 0,
              pristine: false,
              normalized: false,
            },
          },
          normalizedData: {},
        });
      });

      it('handles updateData customized per mutation defined in updateData object key', () => {
        expect(
          queriesReducer(
            initialState,
            createSuccessAction(
              {
                type: MUTATION_ACTION,
                request: { url: '/books', method: 'post' },
                meta: {
                  mutations: {
                    FETCH_BOOK: {
                      updateData: (data, mutationData) =>
                        data + mutationData.nested,
                    },
                  },
                },
              },
              { data: { nested: 'suffix' } },
            ),
            defaultConfig,
          ),
        ).toEqual({
          queries: {
            FETCH_BOOK: {
              data: 'datasuffix',
              error: null,
              pending: 0,
              pristine: false,
              normalized: false,
            },
          },
          normalizedData: {},
        });
      });

      it('reverts optimistic update on mutation error', () => {
        expect(
          queriesReducer(
            initialState,
            createErrorAction(
              {
                type: MUTATION_ACTION,
                request: { url: '/books', method: 'post' },
                meta: {
                  mutations: {
                    FETCH_BOOK: {
                      updateDataOptimistic: () => 'data2',
                      revertData: data => `${data} reverted`,
                    },
                  },
                },
              },
              'error',
            ),
            defaultConfig,
          ),
        ).toEqual({
          queries: {
            FETCH_BOOK: {
              data: 'data reverted',
              error: null,
              pending: 0,
              pristine: false,
              normalized: false,
            },
          },
          normalizedData: {},
        });
      });

      it('doesnt change data on mutation error without optimistic update revertData', () => {
        expect(
          queriesReducer(
            initialState,
            createErrorAction(
              {
                type: MUTATION_ACTION,
                request: { url: '/books', method: 'post' },
                meta: {
                  mutations: {
                    FETCH_BOOK: {
                      updateDataOptimistic: () => 'data2',
                    },
                  },
                },
              },
              'error',
            ),
            defaultConfig,
          ),
        ).toEqual({
          queries: {
            FETCH_BOOK: {
              data: 'data',
              error: null,
              pending: 0,
              pristine: false,
              normalized: false,
            },
          },
          normalizedData: {},
        });
      });

      it('reverts optimistic update on mutation abort', () => {
        expect(
          queriesReducer(
            initialState,
            createAbortAction({
              type: MUTATION_ACTION,
              request: { url: '/books', method: 'post' },
              meta: {
                mutations: {
                  FETCH_BOOK: {
                    updateDataOptimistic: () => 'data2',
                    revertData: data => `${data} reverted`,
                  },
                },
              },
            }),
            defaultConfig,
          ),
        ).toEqual({
          queries: {
            FETCH_BOOK: {
              data: 'data reverted',
              error: null,
              pending: 0,
              pristine: false,
              normalized: false,
            },
          },
          normalizedData: {},
        });
      });

      it('handles local mutations', () => {
        expect(
          queriesReducer(
            initialState,
            {
              type: 'LOCAL_MUTATION_ACTION',
              meta: {
                mutations: {
                  FETCH_BOOK: {
                    local: true,
                    updateData: data => `${data} suffix`,
                  },
                },
              },
            },
            defaultConfig,
          ),
        ).toEqual({
          queries: {
            FETCH_BOOK: {
              data: 'data suffix',
              error: null,
              pending: 0,
              pristine: false,
              normalized: false,
            },
          },
          normalizedData: {},
        });
      });
    });

    describe('with mutations with query request key', () => {
      const initialState = {
        queries: {
          FETCH_BOOK: {
            data: 'data',
            error: null,
            pending: 0,
            pristine: false,
            normalized: false,
          },
          FETCH_BOOK1: {
            data: 'data',
            error: null,
            pending: 0,
            pristine: false,
            normalized: false,
          },
        },
        normalizedData: {},
      };

      const MUTATION_ACTION = 'MUTATION_ACTION';

      it('can update data optimistic', () => {
        expect(
          queriesReducer(
            initialState,
            {
              type: MUTATION_ACTION,
              request: { url: '/books', method: 'post' },
              meta: {
                mutations: {
                  FETCH_BOOK1: {
                    updateDataOptimistic: data => `${data} suffix`,
                  },
                },
              },
            },
            defaultConfig,
          ),
        ).toEqual({
          queries: {
            FETCH_BOOK: {
              data: 'data',
              error: null,
              pending: 0,
              pristine: false,
              normalized: false,
            },
            FETCH_BOOK1: {
              data: 'data suffix',
              error: null,
              pending: 0,
              pristine: false,
              normalized: false,
            },
          },
          normalizedData: {},
        });
      });

      it('handles updateData customized per mutation defined in updateData object key', () => {
        expect(
          queriesReducer(
            initialState,
            createSuccessAction(
              {
                type: MUTATION_ACTION,
                request: { url: '/books', method: 'post' },
                meta: {
                  mutations: {
                    FETCH_BOOK1: {
                      updateData: (data, mutationData) =>
                        data + mutationData.nested,
                    },
                  },
                },
              },
              { data: { nested: 'suffix' } },
            ),
            defaultConfig,
          ),
        ).toEqual({
          queries: {
            FETCH_BOOK: {
              data: 'data',
              error: null,
              pending: 0,
              pristine: false,
              normalized: false,
            },
            FETCH_BOOK1: {
              data: 'datasuffix',
              error: null,
              pending: 0,
              pristine: false,
              normalized: false,
            },
          },
          normalizedData: {},
        });
      });

      it('handles local mutations', () => {
        expect(
          queriesReducer(
            initialState,
            {
              type: 'LOCAL_MUTATION_ACTION',
              meta: {
                mutations: {
                  FETCH_BOOK1: {
                    local: true,
                    updateData: data => `${data} suffix`,
                  },
                },
              },
            },
            defaultConfig,
          ),
        ).toEqual({
          queries: {
            FETCH_BOOK: {
              data: 'data',
              error: null,
              pending: 0,
              pristine: false,
              normalized: false,
            },
            FETCH_BOOK1: {
              data: 'data suffix',
              error: null,
              pending: 0,
              pristine: false,
              normalized: false,
            },
          },
          normalizedData: {},
        });
      });
    });

    describe('with normalization', () => {
      const defaultState = {
        data: null,
        error: null,
        pending: 0,
        pristine: true,
        normalized: true,
        usedKeys: [],
        ref: {},
      };
      const requestAction = {
        type: 'FETCH_BOOK',
        request: { url: '/ ' },
        meta: {
          normalize: true,
        },
      };

      it('should normalize data on query success', () => {
        expect(
          queriesReducer(
            { queries: {}, normalizedData: {} },
            createSuccessAction(requestAction, {
              data: { id: '1', name: 'name' },
            }),
            defaultConfig,
          ),
        ).toEqual({
          queries: {
            FETCH_BOOK: {
              ...defaultState,
              pending: -1,
              data: '@@1',
              usedKeys: { '': ['id', 'name'] },
            },
          },
          normalizedData: { '@@1': { id: '1', name: 'name' } },
        });
      });

      it('should not touch normalized data if query data is the same', () => {
        const initialState = {
          queries: {
            FETCH_BOOK: {
              data: 'data',
              pending: 0,
              error: null,
              normalized: true,
              usedKeys: { '': ['id', 'name'] },
              ref: {},
            },
          },
          normalizedData: {},
        };
        const state = queriesReducer(
          initialState,
          createSuccessAction(requestAction, { data: 'data' }),
          defaultConfig,
        );

        expect(state.normalizedData).toBe(initialState.normalizedData);
      });

      it('should normalize data with nested ids and arrays on query success', () => {
        expect(
          queriesReducer(
            { queries: {}, normalizedData: {} },
            createSuccessAction(requestAction, {
              data: {
                root: {
                  id: '1',
                  name: 'name',
                  nested: [
                    { id: '2', v: 2 },
                    { id: '3', v: 3 },
                  ],
                },
              },
            }),
            defaultConfig,
          ),
        ).toEqual({
          queries: {
            FETCH_BOOK: {
              ...defaultState,
              pending: -1,
              data: {
                root: '@@1',
              },
              usedKeys: {
                '.root': ['id', 'name', 'nested'],
                '.root.nested': ['id', 'v'],
              },
            },
          },
          normalizedData: {
            '@@1': {
              id: '1',
              name: 'name',
              nested: ['@@2', '@@3'],
            },
            '@@2': { id: '2', v: 2 },
            '@@3': { id: '3', v: 3 },
          },
        });
      });

      it('should merge normalized data on query success', () => {
        expect(
          queriesReducer(
            {
              queries: {},
              normalizedData: { '@@1': { id: '1', a: 'a', b: 'b' } },
            },
            createSuccessAction(requestAction, {
              data: { id: '1', a: 'd', c: 'c' },
            }),
            defaultConfig,
          ),
        ).toEqual({
          queries: {
            FETCH_BOOK: {
              ...defaultState,
              pending: -1,
              data: '@@1',
              usedKeys: { '': ['id', 'a', 'c'] },
            },
          },
          normalizedData: { '@@1': { id: '1', a: 'd', b: 'b', c: 'c' } },
        });
      });

      it('should update normalized data on mutation success', () => {
        expect(
          queriesReducer(
            {
              queries: {},
              normalizedData: { '@@1': { id: '1', a: 'a', b: 'b' } },
            },
            createSuccessAction(
              {
                type: 'UPDATE_BOOK',
                request: { url: '/', method: 'put' },
                meta: {
                  normalize: true,
                },
              },
              {
                data: { id: '1', a: 'd', c: 'c' },
              },
            ),
            defaultConfig,
          ),
        ).toEqual({
          queries: {},
          normalizedData: { '@@1': { id: '1', a: 'd', b: 'b', c: 'c' } },
        });
      });

      it('should update normalized query data on mutation success if defined in meta', () => {
        const updateData = jest.fn((data, mutationData) => [
          ...data,
          mutationData,
          { id: '3', x: 3 },
        ]);
        expect(
          queriesReducer(
            {
              queries: {
                FETCH_BOOK: {
                  data: ['@@1'],
                  pending: 0,
                  error: null,
                  normalized: true,
                  ref: {},
                  usedKeys: { '': ['id', 'x'] },
                },
              },
              normalizedData: { '@@1': { id: '1', x: 1 } },
            },
            createSuccessAction(
              {
                type: 'ADD_BOOK',
                request: { url: '/', method: 'put' },
                meta: {
                  normalize: true,
                  mutations: {
                    FETCH_BOOK: updateData,
                  },
                },
              },
              {
                data: { id: '2', x: 2 },
              },
            ),
            defaultConfig,
          ),
        ).toEqual({
          queries: {
            FETCH_BOOK: {
              data: ['@@1', '@@2', '@@3'],
              pending: 0,
              error: null,
              normalized: true,
              usedKeys: { '': ['id', 'x'] },
              ref: {},
            },
          },
          normalizedData: {
            '@@1': { id: '1', x: 1 },
            '@@2': { id: '2', x: 2 },
            '@@3': { id: '3', x: 3 },
          },
        });
        expect(updateData).toBeCalledWith([{ id: '1', x: 1 }], {
          id: '2',
          x: 2,
        });
      });

      it('should update normalized query data with local mutation', () => {
        expect(
          queriesReducer(
            {
              queries: {
                FETCH_BOOK: {
                  data: ['@@1'],
                  pending: 0,
                  error: null,
                  normalized: true,
                  usedKeys: {
                    '': ['id', 'x'],
                  },
                  ref: {},
                },
              },
              normalizedData: { '@@1': { id: '1', x: 1 } },
            },
            {
              type: 'ADD_BOOK_LOCALLY',
              meta: {
                // normalize: true,
                mutations: {
                  FETCH_BOOK: {
                    updateData: data => [...data, { id: '2', x: 2 }],
                    local: true,
                  },
                },
              },
            },
            defaultConfig,
          ),
        ).toEqual({
          queries: {
            FETCH_BOOK: {
              data: ['@@1', '@@2'],
              pending: 0,
              error: null,
              normalized: true,
              usedKeys: { '': ['id', 'x'] },
              ref: {},
            },
          },
          normalizedData: {
            '@@1': { id: '1', x: 1 },
            '@@2': { id: '2', x: 2 },
          },
        });
      });

      it('should update normalized query data with localData', () => {
        expect(
          queriesReducer(
            {
              queries: {
                FETCH_BOOK: {
                  data: ['@@1'],
                  pending: 0,
                  error: null,
                  normalized: true,
                  ref: {},
                },
              },
              normalizedData: { '@@1': { id: '1', x: 1 } },
            },
            {
              type: 'UPDATE_BOOK_LOCALLY',
              meta: {
                localData: { id: '1', x: 2 },
              },
            },
            defaultConfig,
          ),
        ).toEqual({
          queries: {
            FETCH_BOOK: {
              data: ['@@1'],
              pending: 0,
              error: null,
              normalized: true,
              ref: {},
            },
          },
          normalizedData: {
            '@@1': { id: '1', x: 2 },
          },
        });
      });

      it('should update normalized query data with optimisticData', () => {
        expect(
          queriesReducer(
            {
              queries: {
                FETCH_BOOK: {
                  data: ['@@1'],
                  pending: 0,
                  error: null,
                  normalized: true,
                  ref: {},
                },
              },
              normalizedData: { '@@1': { id: '1', x: 1 } },
            },
            {
              type: 'UPDATE_BOOK',
              request: { url: '/books', method: 'post' },
              meta: {
                optimisticData: { id: '1', x: 2 },
              },
            },
            defaultConfig,
          ),
        ).toEqual({
          queries: {
            FETCH_BOOK: {
              data: ['@@1'],
              pending: 0,
              error: null,
              normalized: true,
              ref: {},
            },
          },
          normalizedData: {
            '@@1': { id: '1', x: 2 },
          },
        });
      });

      it('should update normalized query data with revertedData on response error', () => {
        expect(
          queriesReducer(
            {
              queries: {
                FETCH_BOOK: {
                  data: ['@@1'],
                  pending: 0,
                  error: null,
                  normalized: true,
                  ref: {},
                },
              },
              normalizedData: { '@@1': { id: '1', x: 2 } },
            },
            createErrorAction({
              type: 'UPDATE_BOOK',
              request: { url: '/books', method: 'post' },
              meta: {
                optimisticData: { id: '1', x: 2 },
                revertedData: { id: '1', x: 1 },
              },
            }),
            defaultConfig,
          ),
        ).toEqual({
          queries: {
            FETCH_BOOK: {
              data: ['@@1'],
              pending: 0,
              error: null,
              normalized: true,
              ref: {},
            },
          },
          normalizedData: {
            '@@1': { id: '1', x: 1 },
          },
        });
      });

      it('should allow custom shouldObjectBeNormalized and getNormalisationObjectKey', () => {
        expect(
          queriesReducer(
            { queries: {}, normalizedData: {} },
            createSuccessAction(requestAction, {
              data: { _id: '1', name: 'name' },
            }),
            {
              ...defaultConfig,
              getNormalisationObjectKey: obj => obj._id,
              shouldObjectBeNormalized: obj => !!obj._id,
            },
          ),
        ).toEqual({
          queries: {
            FETCH_BOOK: {
              ...defaultState,
              pending: -1,
              data: '@@1',
              usedKeys: { '': ['_id', 'name'] },
            },
          },
          normalizedData: { '@@1': { _id: '1', name: 'name' } },
        });
      });
    });
  });
});
