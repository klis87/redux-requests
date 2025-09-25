import { advanceTo, clear } from 'jest-date-mock';

import { clearRequestsCache, createSuccessAction } from '../actions';
import { createQuery } from '../requests-creators';

import cacheReducer from './cache-reducer';

describe('reducers', () => {
  describe('cacheReducer', () => {
    const defaultState = {
      QUERY: { timeout: null, cacheKey: undefined },
      QUERY2: { timeout: null, cacheKey: undefined },
      QUERY3: { timeout: null, cacheKey: undefined },
    };

    it('clears the whole cache for clearRequestsCache action', () => {
      expect(cacheReducer(defaultState, clearRequestsCache())).toEqual({});
    });

    it('clears specific cache keys for clearRequestsCache', () => {
      expect(
        expect(
          cacheReducer(
            defaultState,
            clearRequestsCache([
              'QUERY',
              { requestType: 'QUERY', requestKey: '2' },
            ]),
          ),
        ).toEqual({
          QUERY3: { timeout: null, cacheKey: undefined },
        }),
      );
    });

    it('doesnt do anything for request action', () => {
      expect(
        cacheReducer(defaultState, createQuery('REQUEST', { url: '/' })()),
      ).toBe(defaultState);
    });

    it('doesnt do anything for response action without meta cache', () => {
      expect(
        cacheReducer(
          defaultState,
          createSuccessAction(createQuery('QUERY4', { url: '/' })(), {
            data: 'data',
          }),
        ),
      ).toBe(defaultState);
    });

    it('doesnt do anything for response action with both meta cache and cacheResponse ', () => {
      expect(
        cacheReducer(
          defaultState,
          createSuccessAction(
            createQuery(
              'QUERY4',
              { url: '/' },
              { cache: true, cacheResponse: { data: 'data' } },
            )(),
            { data: 'data' },
          ),
        ),
      ).toBe(defaultState);
    });

    it('populates cache without timeout  for response action with server data', () => {
      expect(
        cacheReducer(
          defaultState,
          createSuccessAction(
            createQuery('QUERY4', { url: '/' }, { cache: true })(),
            { data: 'data' },
          ),
        ),
      ).toEqual({
        ...defaultState,
        QUERY4: { timeout: null, cacheKey: undefined },
      });
    });

    it('populates cache with timeout for response action with server data', () => {
      try {
        advanceTo(new Date());
        expect(
          cacheReducer(
            defaultState,
            createSuccessAction(
              createQuery('QUERY4', { url: '/' }, { cache: 1 })(),
              { data: 'data' },
            ),
          ),
        ).toEqual({
          ...defaultState,
          QUERY4: { timeout: Date.now() + 1000, cacheKey: undefined },
        });
      } finally {
        clear();
      }
    });
  });
});
