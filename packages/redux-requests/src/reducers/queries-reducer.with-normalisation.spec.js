import defaultConfig from '../default-config';
import { createSuccessAction, createErrorAction } from '../actions';

import queriesReducer from './queries-reducer';

describe('reducers', () => {
  describe('queriesReducer', () => {
    describe('with normalization', () => {
      const defaultState = {
        data: null,
        error: null,
        pending: 0,
        pristine: true,
        normalized: true,
        usedKeys: [],
        dependencies: [],
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
