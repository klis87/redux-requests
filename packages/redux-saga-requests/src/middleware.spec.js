import configureStore from 'redux-mock-store';
import { advanceBy, advanceTo, clear } from 'jest-date-mock';

import {
  success,
  error,
  abort,
  createSuccessAction,
  getRequestCache,
  clearRequestsCache,
} from './actions';
import {
  requestsPromiseMiddleware,
  requestsCacheMiddleware,
  serverRequestsFilterMiddleware,
} from './middleware';

describe('middleware', () => {
  describe('requestsPromiseMiddleware', () => {
    describe('withoutAutoMode', () => {
      const mockStore = configureStore([requestsPromiseMiddleware()]);

      it('doesnt affect non request actions', () => {
        const action = { type: 'NOT_REQUEST' };
        const { dispatch, getActions } = mockStore({});
        const result = dispatch(action);
        expect(result).toEqual(action);
        expect(getActions()).toEqual([action]);
      });

      it('doesnt affect request actions without meta asPromise true', () => {
        const action = { type: 'NOT_REQUEST', meta: { asPromise: true } };
        const { dispatch, getActions } = mockStore({});
        const result = dispatch(action);
        expect(result).toEqual(action);
        expect(getActions()).toEqual([action]);
      });

      it('promisify dispatch result and passes action for request actions', () => {
        const action = {
          type: 'REQUEST',
          request: { url: '/' },
          meta: { asPromise: true },
        };
        const { dispatch, getActions } = mockStore({});
        const result = dispatch(action);
        expect(result).toBeInstanceOf(Promise);
        expect(getActions()).toEqual([action]);
      });

      it('doesnt affect response with meta asPromise false', () => {
        const requestAction = {
          type: 'REQUEST',
          request: { url: '/' },
          meta: { asPromise: false },
        };
        const responseAction = {
          type: success('REQUEST'),
          meta: { requestAction },
        };
        const { dispatch, getActions } = mockStore({});
        const requestResult = dispatch(requestAction);
        const responseResult = dispatch(responseAction);
        expect(requestResult).not.toBeInstanceOf(Promise);
        expect(responseResult).toEqual(responseAction);
        expect(getActions()).toEqual([requestAction, responseAction]);
      });

      it('resolves request dispatch promise for successful response', async () => {
        const requestAction = {
          type: 'REQUEST',
          request: { url: '/' },
          meta: { asPromise: true },
        };
        const responseAction = {
          type: success('REQUEST'),
          meta: { requestAction },
        };
        const { dispatch, getActions } = mockStore({});
        const requestResultPromise = dispatch(requestAction);
        const responseResult = dispatch(responseAction);
        expect(requestResultPromise).toBeInstanceOf(Promise);
        expect(responseResult).toEqual(responseAction);
        expect(getActions()).toEqual([requestAction, responseAction]);
        const requestResult = await requestResultPromise;
        expect(requestResult).toEqual(responseAction);
      });

      it('rejects request dispatch promise for error response', async () => {
        const requestAction = {
          type: 'REQUEST',
          request: { url: '/' },
          meta: { asPromise: true },
        };
        const errorAction = {
          type: error('REQUEST'),
          meta: { requestAction },
        };
        const { dispatch, getActions } = mockStore({});
        const requestResultPromise = dispatch(requestAction);
        const errorResult = dispatch(errorAction);
        expect(requestResultPromise).toBeInstanceOf(Promise);
        expect(errorResult).toEqual(errorAction);
        expect(getActions()).toEqual([requestAction, errorAction]);

        let requestResult;

        try {
          await requestResultPromise;
        } catch (e) {
          requestResult = e;
        }

        expect(requestResult).toEqual(errorAction);
      });

      it('rejects request dispatch promise for abort response', async () => {
        const requestAction = {
          type: 'REQUEST',
          request: { url: '/' },
          meta: { asPromise: true },
        };
        const abortAction = {
          type: abort('REQUEST'),
          meta: { requestAction },
        };
        const { dispatch, getActions } = mockStore({});
        const requestResultPromise = dispatch(requestAction);
        const abortResult = dispatch(abortAction);
        expect(requestResultPromise).toBeInstanceOf(Promise);
        expect(abortResult).toEqual(abortAction);
        expect(getActions()).toEqual([requestAction, abortAction]);

        let requestResult;

        try {
          await requestResultPromise;
        } catch (e) {
          requestResult = e;
        }

        expect(requestResult).toEqual(abortAction);
      });
    });

    describe('withAutoMode', () => {
      const mockStore = configureStore([
        requestsPromiseMiddleware({ auto: true }),
      ]);

      it('doesnt affect non request actions', () => {
        const action = { type: 'NOT_REQUEST' };
        const { dispatch, getActions } = mockStore({});
        const result = dispatch(action);
        expect(result).toEqual(action);
        expect(getActions()).toEqual([action]);
      });

      it('doesnt affect response with meta asPromise false', () => {
        const action = {
          type: 'REQUEST',
          request: { url: '/' },
          meta: { asPromise: false },
        };
        const { dispatch, getActions } = mockStore({});
        const result = dispatch(action);
        expect(result).toEqual(action);
        expect(getActions()).toEqual([action]);
      });

      it('promisify dispatch result and passes action for request actions', () => {
        const action = { type: 'REQUEST', request: { url: '/' } };
        const { dispatch, getActions } = mockStore({});
        const result = dispatch(action);
        expect(result).toBeInstanceOf(Promise);
        expect(getActions()).toEqual([action]);
      });

      it('resolves request dispatch promise for successful response', async () => {
        const requestAction = { type: 'REQUEST', request: { url: '/' } };
        const responseAction = {
          type: success('REQUEST'),
          meta: { requestAction },
        };
        const { dispatch, getActions } = mockStore({});
        const requestResultPromise = dispatch(requestAction);
        const responseResult = dispatch(responseAction);
        expect(requestResultPromise).toBeInstanceOf(Promise);
        expect(responseResult).toEqual(responseAction);
        expect(getActions()).toEqual([requestAction, responseAction]);
        const requestResult = await requestResultPromise;
        expect(requestResult).toEqual(responseAction);
      });

      it('rejects request dispatch promise for error response', async () => {
        const requestAction = { type: 'REQUEST', request: { url: '/' } };
        const errorAction = {
          type: error('REQUEST'),
          meta: { requestAction },
        };
        const { dispatch, getActions } = mockStore({});
        const requestResultPromise = dispatch(requestAction);
        const errorResult = dispatch(errorAction);
        expect(requestResultPromise).toBeInstanceOf(Promise);
        expect(errorResult).toEqual(errorAction);
        expect(getActions()).toEqual([requestAction, errorAction]);

        let requestResult;

        try {
          await requestResultPromise;
        } catch (e) {
          requestResult = e;
        }

        expect(requestResult).toEqual(errorAction);
      });

      it('rejects request dispatch promise for abort response', async () => {
        const requestAction = { type: 'REQUEST', request: { url: '/' } };
        const abortAction = {
          type: abort('REQUEST'),
          meta: { requestAction },
        };
        const { dispatch, getActions } = mockStore({});
        const requestResultPromise = dispatch(requestAction);
        const abortResult = dispatch(abortAction);
        expect(requestResultPromise).toBeInstanceOf(Promise);
        expect(abortResult).toEqual(abortAction);
        expect(getActions()).toEqual([requestAction, abortAction]);

        let requestResult;

        try {
          await requestResultPromise;
        } catch (e) {
          requestResult = e;
        }

        expect(requestResult).toEqual(abortAction);
      });
    });
  });

  describe('requestsCacheMiddleware', () => {
    it('doesnt dispatch anything on getRequestCache action', () => {
      const mockStore = configureStore([requestsCacheMiddleware()]);
      const store = mockStore({});
      store.dispatch(getRequestCache());
      expect(store.getActions()).toEqual([]);
    });

    it('returns map on getRequestCache action', () => {
      const mockStore = configureStore([requestsCacheMiddleware()]);
      const store = mockStore({});
      const result = store.dispatch(getRequestCache());
      expect(result).toEqual(new Map());
    });

    it('doesnt affect non request actions', () => {
      const mockStore = configureStore([requestsCacheMiddleware()]);
      const store = mockStore({});
      const action = { type: 'NOT_REQUEST' };
      const result = store.dispatch(action);
      expect(result).toEqual(action);
      expect(store.getActions()).toEqual([action]);
      expect(store.dispatch(getRequestCache())).toEqual(new Map());
    });

    it('doesnt affect request actions with no meta cache', () => {
      const mockStore = configureStore([requestsCacheMiddleware()]);
      const store = mockStore({});
      const action = { type: 'REQUEST', request: { url: '/' } };
      const responseAction = createSuccessAction(action, null, null);
      store.dispatch(action);
      store.dispatch(responseAction);
      expect(store.getActions()).toEqual([action, responseAction]);
      expect(store.dispatch(getRequestCache())).toEqual(new Map());
    });

    it('adds cacheResponse to request action when meta cache is true', () => {
      const mockStore = configureStore([requestsCacheMiddleware()]);
      const store = mockStore({});
      const action = {
        type: 'REQUEST',
        request: { url: '/' },
        meta: { cache: true },
      };
      const responseAction = createSuccessAction(action, null, {
        data: 'data',
      });
      store.dispatch(action);
      store.dispatch(responseAction);
      expect(store.getActions()).toEqual([action, responseAction]);
      expect(store.dispatch(getRequestCache())).toEqual(
        new Map([
          [
            'REQUEST',
            {
              expiring: null,
              response: { data: 'data' },
            },
          ],
        ]),
      );
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
      const responseAction = createSuccessAction(action, null, {
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
      const responseAction = createSuccessAction(action, null, {
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
      const responseAction = createSuccessAction(action, null, {
        data: 'data',
      });
      store.dispatch(action);
      store.dispatch(responseAction);
      store.dispatch(clearRequestsCache());
      expect(store.dispatch(getRequestCache())).toEqual(new Map());
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
      const responseAction = createSuccessAction(action, null, {
        data: 'data',
      });
      store.dispatch(action);
      store.dispatch(responseAction);
      store.dispatch(clearRequestsCache('REQUEST'));
      expect(store.dispatch(getRequestCache())).toEqual(new Map());
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
        createSuccessAction(createRequestAction(id), id, {
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
      const store = mockStore({});
      const createRequestAction = id => ({
        type: 'REQUEST',
        request: { url: `/${id}` },
        meta: { cache: true, cacheKey: id, cacheSize: 1 },
      });
      const createResponseAction = id =>
        createSuccessAction(createRequestAction(id), id, {
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

  describe('serverRequestsFilterMiddleware', () => {
    it('doesnt dispatch request already dispatched on server', () => {
      const serverRequest = {
        type: 'SERVER_REQUEST',
        request: { url: '/' },
      };
      const responseServerRequest = createSuccessAction(serverRequest, null);
      const clientRequest = {
        type: 'CLIENT_REQUEST',
        request: { url: '/' },
      };
      const nonRequestAction = { type: 'NOT_REQUEST' };
      const mockStore = configureStore([
        serverRequestsFilterMiddleware({
          serverRequestResponseActions: [responseServerRequest],
        }),
      ]);
      const store = mockStore({});
      expect(store.dispatch(serverRequest)).toEqual(null);
      expect(store.dispatch(serverRequest)).toEqual(serverRequest);
      expect(store.dispatch(clientRequest)).toEqual(clientRequest);
      expect(store.dispatch(nonRequestAction)).toEqual(nonRequestAction);
      expect(store.getActions()).toEqual([
        serverRequest,
        clientRequest,
        nonRequestAction,
      ]);
    });

    it('allows passing custom areActionsEqual callback', () => {
      const serverRequest = {
        type: 'REQUEST',
        request: { url: '/', data: { param: 1 } },
      };
      const responseServerRequest = createSuccessAction(serverRequest, null);
      const clientRequest = {
        type: 'REQUEST',
        request: { url: '/', data: { param: 2 } },
      };
      const mockStore = configureStore([
        serverRequestsFilterMiddleware({
          serverRequestResponseActions: [responseServerRequest],
          areActionsEqual: (serverResponseAction, clientRequestAction) => {
            const serverRequestAction = serverResponseAction.meta.requestAction;
            return (
              serverRequestAction.type === clientRequestAction.type &&
              serverRequestAction.request.data.param ===
                clientRequestAction.request.data.param
            );
          },
        }),
      ]);
      const store = mockStore({});
      expect(store.dispatch(clientRequest)).toEqual(clientRequest);
      expect(store.dispatch(serverRequest)).toEqual(null);
      expect(store.getActions()).toEqual([clientRequest]);
    });
  });
});
