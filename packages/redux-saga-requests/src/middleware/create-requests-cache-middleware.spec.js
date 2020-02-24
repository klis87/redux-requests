import configureStore from 'redux-mock-store';
import { advanceBy, advanceTo, clear } from 'jest-date-mock';

import { createSuccessAction } from '../actions';
import { createRequestsCacheMiddleware } from '.';

describe('middleware', () => {
  describe('createRequestsCacheMiddleware', () => {
    it('doesnt affect non request actions', () => {
      const mockStore = configureStore([createRequestsCacheMiddleware()]);
      const store = mockStore({});
      const action = { type: 'NOT_REQUEST' };
      const result = store.dispatch(action);
      expect(result).toEqual(action);
      expect(store.getActions()).toEqual([action]);
    });

    it('doesnt affect request actions with no meta cache', () => {
      const mockStore = configureStore([createRequestsCacheMiddleware()]);
      const store = mockStore({});
      const action = { type: 'REQUEST', request: { url: '/' } };
      const responseAction = createSuccessAction(action, { data: null });
      store.dispatch(action);
      store.dispatch(responseAction);
      expect(store.getActions()).toEqual([action, responseAction]);
    });

    it('adds cacheResponse to request action when meta cache is true and cache is infinite', () => {
      const mockStore = configureStore([createRequestsCacheMiddleware()]);
      const store = mockStore({
        network: {
          queries: { REQUEST: { ref: {}, data: 'data' } },
          cache: { REQUEST: null },
        },
      });
      const action = {
        type: 'REQUEST',
        request: { url: '/' },
        meta: { cache: true },
      };
      store.dispatch(action);
      expect(store.getActions()).toEqual([
        {
          type: 'REQUEST',
          request: { url: '/' },
          meta: { cache: true, cacheResponse: { data: 'data' } },
        },
      ]);
    });

    it('adds cacheResponse to request action when meta cache is 1 and cache not expired', () => {
      try {
        advanceTo(new Date());
        const mockStore = configureStore([createRequestsCacheMiddleware()]);
        const store = mockStore({
          network: {
            queries: { REQUEST: { ref: {}, data: 'data' } },
            cache: { REQUEST: Date.now() },
          },
        });
        const action = {
          type: 'REQUEST',
          request: { url: '/' },
          meta: { cache: 1 },
        };
        store.dispatch(action);
        expect(store.getActions()).toEqual([
          {
            type: 'REQUEST',
            request: { url: '/' },
            meta: { cache: 1, cacheResponse: { data: 'data' } },
          },
        ]);
      } finally {
        clear();
      }
    });

    it('doesnt add cacheResponse to request action when meta cache is 1 and cache expired', () => {
      try {
        advanceTo(new Date());
        const mockStore = configureStore([createRequestsCacheMiddleware()]);
        const store = mockStore({
          network: {
            queries: { REQUEST: { ref: {}, data: 'data' } },
            cache: { REQUEST: Date.now() },
          },
        });
        const action = {
          type: 'REQUEST',
          request: { url: '/' },
          meta: { cache: 1 },
        };
        advanceBy(1);
        store.dispatch(action);
        expect(store.getActions()).toEqual([action]);
      } finally {
        clear();
      }
    });

    it('doesnt do anything to request action when meta cache is true but cache not present', () => {
      const mockStore = configureStore([createRequestsCacheMiddleware()]);
      const store = mockStore({
        network: {
          queries: { REQUEST: { ref: {}, data: 'data' } },
          cache: {},
        },
      });
      const action = {
        type: 'REQUEST',
        request: { url: '/' },
        meta: { cache: true },
      };
      store.dispatch(action);
      expect(store.getActions()).toEqual([
        {
          type: 'REQUEST',
          request: { url: '/' },
          meta: { cache: true },
        },
      ]);
    });
  });
});
