import configureStore from 'redux-mock-store';
import { advanceBy, advanceTo, clear } from 'jest-date-mock';

import {
  success,
  error,
  abort,
  createSuccessAction,
  clearRequestsCache,
} from './actions';
import {
  requestsPromiseMiddleware,
  requestsCacheMiddleware,
} from './middleware';

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
    const responseAction = createSuccessAction(action, null);
    store.dispatch(action);
    store.dispatch(responseAction);
    store.clearActions();
    const result = store.dispatch(action);
    expect(result).toEqual(action);
    expect(store.getActions()).toEqual([action]);
  });

  it('doesnt affect request actions after clearing the whole cache', () => {
    const mockStore = configureStore([requestsCacheMiddleware()]);
    const store = mockStore({});
    const action = {
      type: 'REQUEST',
      request: { url: '/' },
      meta: { cache: true },
    };
    const responseAction = createSuccessAction(action, null);
    store.dispatch(action);
    store.dispatch(responseAction);
    store.dispatch(clearRequestsCache());
    store.clearActions();
    const result = store.dispatch(action);
    expect(result).toEqual(action);
    expect(store.getActions()).toEqual([action]);
  });

  it('doesnt affect request actions after clearing action cache', () => {
    const mockStore = configureStore([requestsCacheMiddleware()]);
    const store = mockStore({});
    const action = {
      type: 'REQUEST',
      request: { url: '/' },
      meta: { cache: true },
    };
    const responseAction = createSuccessAction(action, null);
    store.dispatch(action);
    store.dispatch(responseAction);
    store.dispatch(clearRequestsCache('REQUEST', 'ANOTHER'));
    store.clearActions();
    const result = store.dispatch(action);
    expect(result).toEqual(action);
    expect(store.getActions()).toEqual([action]);
  });

  it('doesnt dispatch request with meta cache true', () => {
    const mockStore = configureStore([requestsCacheMiddleware()]);
    const store = mockStore({});
    const action = {
      type: 'REQUEST',
      request: { url: '/' },
      meta: { cache: true },
    };
    const responseAction = createSuccessAction(action, null);
    store.dispatch(action);
    store.dispatch(responseAction);
    store.clearActions();
    const result = store.dispatch(action);
    expect(result).toEqual(null);
    expect(store.getActions()).toEqual([]);
  });

  it('clearing unrelated cache doesnt affect valid cache', () => {
    const mockStore = configureStore([requestsCacheMiddleware()]);
    const store = mockStore({});
    const action = {
      type: 'REQUEST',
      request: { url: '/' },
      meta: { cache: true },
    };
    const responseAction = createSuccessAction(action, null);
    store.dispatch(action);
    store.dispatch(responseAction);
    store.dispatch(clearRequestsCache('NOT_RELATED'));
    store.clearActions();
    const result = store.dispatch(action);
    expect(result).toEqual(null);
    expect(store.getActions()).toEqual([]);
  });

  it('doesnt dispatch request with meta cache as integer when cache valid', () => {
    advanceTo(new Date(2018, 1, 1, 0, 0, 0));
    const mockStore = configureStore([requestsCacheMiddleware()]);
    const store = mockStore({});
    const action = {
      type: 'REQUEST',
      request: { url: '/' },
      meta: { cache: 1 },
    };
    const responseAction = createSuccessAction(action, null);
    store.dispatch(action);
    store.dispatch(responseAction);
    store.clearActions();
    advanceBy(1000);
    const result = store.dispatch(action);
    clear();
    expect(result).toEqual(null);
    expect(store.getActions()).toEqual([]);
  });

  it('dispatches request with meta cache as integer when cache expired', () => {
    advanceTo(new Date(2018, 1, 1, 0, 0, 0));
    const mockStore = configureStore([requestsCacheMiddleware()]);
    const store = mockStore({});
    const action = {
      type: 'REQUEST',
      request: { url: '/' },
      meta: { cache: 1 },
    };
    const responseAction = createSuccessAction(action, null);
    store.dispatch(action);
    store.dispatch(responseAction);
    store.clearActions();
    advanceBy(1001);
    const result = store.dispatch(action);
    clear();
    expect(result).toEqual(action);
    expect(store.getActions()).toEqual([action]);
  });
});
