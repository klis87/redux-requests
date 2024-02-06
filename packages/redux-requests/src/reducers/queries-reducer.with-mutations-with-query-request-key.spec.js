import defaultConfig from '../default-config';
import { createSuccessAction } from '../actions';
import { createMutation, createLocalMutation } from '../requests-creators';

import queriesReducer from './queries-reducer';

describe('reducers', () => {
  describe('queriesReducer', () => {
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
            createMutation(
              MUTATION_ACTION,
              { url: '/books', method: 'post' },
              {
                mutations: {
                  FETCH_BOOK1: {
                    updateDataOptimistic: data => `${data} suffix`,
                  },
                },
              },
            )(),
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
              createMutation(
                MUTATION_ACTION,
                { url: '/books', method: 'post' },
                {
                  mutations: {
                    FETCH_BOOK1: {
                      updateData: (data, mutationData) =>
                        data + mutationData.nested,
                    },
                  },
                },
              )(),
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
            createLocalMutation('LOCAL_MUTATION_ACTION', {
              mutations: {
                FETCH_BOOK1: data => `${data} suffix`,
              },
            })(),
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
  });
});
