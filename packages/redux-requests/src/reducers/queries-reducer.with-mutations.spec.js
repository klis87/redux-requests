import defaultConfig from '../default-config';
import {
  createSuccessAction,
  createErrorAction,
  createAbortAction,
} from '../actions';

import queriesReducer from './queries-reducer';

describe('reducers', () => {
  describe('queriesReducer', () => {
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
  });
});
