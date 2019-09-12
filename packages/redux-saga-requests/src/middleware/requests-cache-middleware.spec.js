import configureStore from 'redux-mock-store';
import { advanceBy, advanceTo, clear } from 'jest-date-mock';

import { createSuccessAction, clearRequestsCache } from '../actions';
import { requestsCacheMiddleware } from '.';

describe('middleware', () => {
  describe('requestsCacheMiddleware', () => {
    it('doesnt affect non request actions', () => {
      const mockStore = configureStore([requestsCacheMiddleware()]);
      const store = mockStore({});
      const action = { type: 'NOT_REQUEST' };
      const result = store.dispatch(action);
      expect(result).toEqual(action);
      expect(store.getActions()).toEqual([action]);
    });

    it('doesnt affect request actions with no meta cache', () => {
      const mockStore = configureStore([requestsCacheMiddleware()]);
      const store = mockStore({});
      const action = { type: 'REQUEST', request: { url: '/' } };
      const responseAction = createSuccessAction(action, { data: null });
      store.dispatch(action);
      store.dispatch(responseAction);
      expect(store.getActions()).toEqual([action, responseAction]);
    });

    it('adds cacheResponse to request action when meta cache is true', () => {
      const mockStore = configureStore([requestsCacheMiddleware()]);
      const store = mockStore({});
      const action = {
        type: 'REQUEST',
        request: { url: '/' },
        meta: { cache: true },
      };
      const responseAction = createSuccessAction(action, {
        data: 'data',
      });
      store.dispatch(action);
      store.dispatch(responseAction);
      expect(store.getActions()).toEqual([action, responseAction]);
      store.clearActions();
      store.dispatch(action);
      expect(store.getActions()).toEqual([
        {
          type: 'REQUEST',
          request: { url: '/' },
          meta: { cache: true, cacheResponse: { data: 'data' } },
        },
      ]);
    });

    it('adds cacheResponse to request action when meta cache is integer and valid', () => {
      advanceTo(new Date(2018, 1, 1, 0, 0, 0));
      const mockStore = configureStore([requestsCacheMiddleware()]);
      const store = mockStore({});
      const action = {
        type: 'REQUEST',
        request: { url: '/' },
        meta: { cache: 1 },
      };
      const responseAction = createSuccessAction(action, {
        data: 'data',
      });
      store.dispatch(action);
      store.dispatch(responseAction);
      expect(store.getActions()).toEqual([action, responseAction]);
      store.clearActions();
      advanceBy(1000);
      store.dispatch(action);
      clear();
      expect(store.getActions()).toEqual([
        {
          type: 'REQUEST',
          request: { url: '/' },
          meta: { cache: 1, cacheResponse: { data: 'data' } },
        },
      ]);
    });

    it('doesnt add cacheResponse to request action when meta cache is integer and invalid', () => {
      advanceTo(new Date(2018, 1, 1, 0, 0, 0));
      const mockStore = configureStore([requestsCacheMiddleware()]);
      const store = mockStore({});
      const action = {
        type: 'REQUEST',
        request: { url: '/' },
        meta: { cache: 1 },
      };
      const responseAction = createSuccessAction(action, {
        data: 'data',
      });
      store.dispatch(action);
      store.dispatch(responseAction);
      advanceBy(1000);
      store.dispatch(action);
      store.dispatch(
        createSuccessAction(
          {
            type: 'REQUEST',
            request: { url: '/' },
            meta: { cache: 1, cacheResponse: { data: 'data' } },
          },
          null,
          { data: 'data' },
        ),
      );
      advanceBy(1);
      store.clearActions();
      store.dispatch(action);
      clear();
      expect(store.getActions()).toEqual([action]);
    });

    it('doesnt add cacheResponse to request action after the whole cache is cleared', () => {
      const mockStore = configureStore([requestsCacheMiddleware()]);
      const store = mockStore({});
      const action = {
        type: 'REQUEST',
        request: { url: '/' },
        meta: { cache: true },
      };
      const responseAction = createSuccessAction(action, {
        data: 'data',
      });
      store.dispatch(action);
      store.dispatch(responseAction);
      store.dispatch(clearRequestsCache());
      store.clearActions();
      store.dispatch(action);
      expect(store.getActions()).toEqual([action]);
    });

    it('doesnt add cacheResponse to request action after specific action cache is cleared', () => {
      const mockStore = configureStore([requestsCacheMiddleware()]);
      const store = mockStore({});
      const action = {
        type: 'REQUEST',
        request: { url: '/' },
        meta: { cache: true },
      };
      const responseAction = createSuccessAction(action, {
        data: 'data',
      });
      store.dispatch(action);
      store.dispatch(responseAction);
      store.dispatch(clearRequestsCache('REQUEST'));
      store.clearActions();
      store.dispatch(action);
      expect(store.getActions()).toEqual([action]);
    });

    const wrapWithCacheResponse = action => ({
      ...action,
      meta: { ...action.meta, cacheResponse: { data: action.meta.cacheKey } },
    });

    it('supports meta cacheKey', () => {
      const mockStore = configureStore([requestsCacheMiddleware()]);
      const store = mockStore({});
      const createRequestAction = id => ({
        type: 'REQUEST',
        request: { url: `/${id}` },
        meta: { cache: true, cacheKey: id },
      });
      const createResponseAction = id =>
        createSuccessAction(createRequestAction(id), {
          data: id,
        });

      store.dispatch(createRequestAction('1'));
      store.dispatch(createResponseAction('1'));
      store.dispatch(createRequestAction('1'));
      store.dispatch(createResponseAction('1'));
      store.dispatch(createRequestAction('2'));
      store.dispatch(createResponseAction('2'));
      store.dispatch(createRequestAction('1'));
      store.dispatch(createResponseAction('1'));

      expect(store.getActions()).toEqual([
        createRequestAction('1'),
        createResponseAction('1'),
        wrapWithCacheResponse(createRequestAction('1')),
        createResponseAction('1'),
        createRequestAction('2'),
        createResponseAction('2'),
        wrapWithCacheResponse(createRequestAction('1')),
        createResponseAction('1'),
      ]);
    });

    it('supports meta cacheSize', () => {
      const mockStore = configureStore([requestsCacheMiddleware()]);
      const store = mockStore({ network: { cache: {} } });
      const createRequestAction = id => ({
        type: 'REQUEST',
        request: { url: `/${id}` },
        meta: { cache: true, cacheKey: id, cacheSize: 1 },
      });
      const createResponseAction = id =>
        createSuccessAction(createRequestAction(id), {
          data: id,
        });

      store.dispatch(createRequestAction('1'));
      store.dispatch(createResponseAction('1'));
      store.dispatch(createRequestAction('1'));
      store.dispatch(createResponseAction('1'));
      store.dispatch(createRequestAction('2'));
      store.dispatch(createResponseAction('2'));
      store.dispatch(createRequestAction('1'));
      store.dispatch(createResponseAction('1'));

      expect(store.getActions()).toEqual([
        createRequestAction('1'),
        createResponseAction('1'),
        wrapWithCacheResponse(createRequestAction('1')),
        createResponseAction('1'),
        createRequestAction('2'),
        createResponseAction('2'),
        createRequestAction('1'),
        createResponseAction('1'),
      ]);
    });
  });
});
