import defaultConfig from '../default-config';
import { createSuccessAction, createErrorAction } from '../actions';

import queriesReducer from './queries-reducer';

/*
1) fetchBooks
[
  { id: 1, name: 'Harry', author: { id: 100, surname: 'Harry author' }, likers: [], },
  { id: 2, name: 'Lord', author: { id: 101, surname: 'Lord author' }, likers: [], },
]

fetchBooks: ['@@1', '@@2'],
@@1: { id: 1, name: 'Harry', author: '@@100', likers: [] }
@@2: { id: 2, name: 'Lord', author: '@@101', likers: [] }
@@100: { id: 100, surname: 'Harry author' }
@@101: { id: 101, surname: 'Lord author' }

dependencies:
fetchBooks: [@@1, @@2, @@100, @@101]

dependents:
@@1: [fetchBooks]
@@2: [fetchBooks]
@@100: [fetchBooks]
@@101: [fetchBooks]

2) fetchBook 1

{ id: 1, name: 'Harry', author: { id: 100, surname: 'Harry author' } }

fetchBooks: ['@@1', '@@2']
fetchBook: '@@1'
@@1: { id: 1, name: 'Harry', author: '@@100', likers: [] }
@@2: { id: 2, name: 'Lord', author: '@@101', likers: [] }
@@100: { id: 100, surname: 'Harry author' }
@@101: { id: 101, surname: 'Lord author' }

dependencies:
fetchBooks: [@@1, @@2, @@100, @@101]
fetchBooks: [@@1, @@100]

dependents:
@@1: [fetchBooks, fetchBook]
@@2: [fetchBooks]
@@100: [fetchBooks, fetchBook]
@@101: [fetchBooks]

3) updateBook 1

{ id: 1, name: 'Harry 2', author: { id: 100, surname: 'Harry 2 author' }, liker: { id: 1000 } }

mutation dependencies: [@@1, @@100, @1000]
getting affected queries: [fetchBooks, fetchBook]
recalculate them, nothing changed re dependencies

!!!!! what to do about this 1000 we must ignore it, not a dependency!

fetchBooks: ['@@1', '@@2']
fetchBook: '@@1'
@@1: { id: 1, name: 'Harry 2', author: '@@100' }
@@2: { id: 2, name: 'Lord', author: '@@101' }
@@100: { id: 100, surname: 'Harry 2 author' }
@@101: { id: 101, surname: 'Lord author' }

dependencies:
fetchBooks: [@@1, @@2, @@100, @@101]
fetchBooks: [@@1, @@100]

dependents:
@@1: [fetchBooks, fetchBook]
@@2: [fetchBooks]
@@100: [fetchBooks, fetchBook]
@@101: [fetchBooks]

4) updateBook 1 - change author!

{ id: 1, author: { id: 102, surname: 'Harry 2 new author' }, liker: { id: 1000 } }

mutation dependencies: [@@1, @@102, @1000]
@@1 found, getting affected queries: [fetchBooks, fetchBook]
recalculate them, new dependencies:
dependencies:
fetchBooks: [@@1, @@2, @@100, @@101] => [@@1, @@2, @@102, @@101] 100 gone, 102 added
fetchBook: [@@1, @@100] => [@@1, @@102] 100 gone, 102 added

!!!!! what to do about this 1000 we must ignore it, not a dependency!

fetchBooks: ['@@1', '@@2']
fetchBook: '@@1'
@@1: { id: 1, name: 'Harry 2', author: '@@102' }
@@2: { id: 2, name: 'Lord', author: '@@101' }
@@102: { id: 102, surname: 'Harry 2 new author' }
@@101: { id: 101, surname: 'Lord author' }


dependents:
@@1: [fetchBooks, fetchBook]
@@2: [fetchBooks]
@@102: [fetchBooks, fetchBook]
@@101: [fetchBooks]
@@100: [] to remove

5) updateBook 1 - add liker!

{ id: 1, likers: [{ id: 1000 }] }

mutation dependencies: [@@1, @@1000]
@@1 found, getting affected queries: [fetchBooks, fetchBook]

recalculate them, new dependencies:
dependencies:
fetchBooks: [@@1, @@2, @@102, @@101] => [@@1, @@2, @@102, @@101, @@1000] 1000 added!
fetchBook: [@@1, @@102] => [@@1, @@102, @@1000] 1000 added


fetchBooks: ['@@1', '@@2']
fetchBook: '@@1'
@@1: { id: 1, name: 'Harry 2', author: '@@102' }
@@2: { id: 2, name: 'Lord', author: '@@101' }
@@102: { id: 102, surname: 'Harry 2 new author' }
@@101: { id: 101, surname: 'Lord author' }
@@1000: { id: 1000 }

dependents:
@@1: [fetchBooks, fetchBook]
@@2: [fetchBooks]
@@102: [fetchBooks, fetchBook]
@@101: [fetchBooks]
@@1000: [fetchBooks, fetchBook]

6) reset fetchBooks

fetchBooks: null
fetchBook: '@@1'
@@1: { id: 1, name: 'Harry', author: '@@100' }
@@2: { id: 2, name: 'Lord', author: '@@101' }
@@100: { id: 100, surname: 'Harry author' }
@@101: { id: 101, surname: 'Lord author' }

dependencies:
fetchBooks: [] diff -1, 2, 100, 101
fetchBooks: [@@1, @@100]

dependents:
@@1: [fetchBook]
@@2: [] // safe to remove
@@100: [fetchBook]
@@101: [] // safe to remove

*/

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
              dependencies: ['@@1'],
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
              dependencies: [],
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
              dependencies: ['@@1', '@@2', '@@3'],
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
              dependencies: ['@@1'],
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
                  dependencies: ['@@1'],
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
              dependencies: ['@@1', '@@2', '@@3'],
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
                  dependencies: ['@@1'],
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
              dependencies: ['@@1', '@@2'],
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
                  dependencies: ['@@1'],
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
              dependencies: ['@@1'],
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
                  dependencies: ['@@1'],
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
              dependencies: ['@@1'],
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
                  dependencies: ['@@1'],
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
              dependencies: ['@@1'],
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
              dependencies: ['@@1'],
              usedKeys: { '': ['_id', 'name'] },
            },
          },
          normalizedData: { '@@1': { _id: '1', name: 'name' } },
        });
      });
    });
  });
});
