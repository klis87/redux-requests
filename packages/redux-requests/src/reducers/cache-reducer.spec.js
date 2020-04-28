import { advanceTo, clear } from 'jest-date-mock';

import { clearRequestsCache, createSuccessAction } from '../actions';
import cacheReducer from './cache-reducer';

describe('reducers', () => {
  describe('cacheReducer', () => {
    const defaultState = {
      QUERY: null,
      QUERY2: null,
      QUERY3: null,
    };

    it('clears the whole cache for clearRequestsCache action', () => {
      expect(cacheReducer(defaultState, clearRequestsCache())).toEqual({});
    });

    it('clears specific cache keys for clearRequestsCache', () => {
      expect(
        expect(
          cacheReducer(defaultState, clearRequestsCache('QUERY', 'QUERY2')),
        ).toEqual({
          QUERY3: null,
        }),
      );
    });

    it('doesnt do anything for request action', () => {
      expect(
        cacheReducer(defaultState, { type: 'REQUEST', request: { url: '/' } }),
      ).toBe(defaultState);
    });

    it('doesnt do anything for response action without meta cache', () => {
      expect(
        cacheReducer(
          defaultState,
          createSuccessAction(
            { type: 'QUERY4', request: { url: '/' } },
            { data: 'data' },
          ),
        ),
      ).toBe(defaultState);
    });

    it('doesnt do anything for response action with both meta cache and cacheResponse ', () => {
      expect(
        cacheReducer(
          defaultState,
          createSuccessAction(
            {
              type: 'QUERY4',
              request: { url: '/' },
              meta: { cache: true, cacheResponse: { data: 'data' } },
            },
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
            { type: 'QUERY4', request: { url: '/' }, meta: { cache: true } },
            { data: 'data' },
          ),
        ),
      ).toEqual({ ...defaultState, QUERY4: null });
    });

    it('populates cache with timeout for response action with server data', () => {
      try {
        advanceTo(new Date());
        expect(
          cacheReducer(
            defaultState,
            createSuccessAction(
              { type: 'QUERY4', request: { url: '/' }, meta: { cache: 1 } },
              { data: 'data' },
            ),
          ),
        ).toEqual({ ...defaultState, QUERY4: Date.now() + 1000 });
      } finally {
        clear();
      }
    });
  });
});
