import defaultConfig from '../default-config';
import {
  createSuccessAction,
  createErrorAction,
  createAbortAction,
} from '../actions';
import { createQuery } from '../requests-creators';

import queriesReducer from './queries-reducer';

describe('reducers', () => {
  describe('queriesReducer', () => {
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
      const requestAction = createQuery(
        'FETCH_BOOK',
        { url: '/ ' },
        {
          requestKey: 1,
        },
      )();

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
  });
});
