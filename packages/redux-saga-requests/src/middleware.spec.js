import configureStore from 'redux-mock-store';

import { success, error, abort, getActionWithSuffix } from './actions';
import { requestsPromiseMiddleware } from './middleware';

describe('requestsPromiseMiddleware', () => {
  describe('withoutAutoMode', () => {
    const mockStore = configureStore([requestsPromiseMiddleware()]);

    it('doesnt affect non request actions', () => {
      const action = { type: 'NOT_REQUEST' };
      const { dispatch, getActions } = mockStore({});
      const result = dispatch(action);
      assert.deepEqual(result, action);
      assert.deepEqual(getActions(), [action]);
    });

    it('doesnt affect request actions without meta asPromise true', () => {
      const action = { type: 'NOT_REQUEST', meta: { asPromise: true } };
      const { dispatch, getActions } = mockStore({});
      const result = dispatch(action);
      assert.deepEqual(result, action);
      assert.deepEqual(getActions(), [action]);
    });

    it('promisify dispatch result and passes action for request actions', () => {
      const action = {
        type: 'REQUEST',
        request: {},
        meta: { asPromise: true },
      };
      const { dispatch, getActions } = mockStore({});
      const result = dispatch(action);
      assert.instanceOf(result, Promise);
      assert.deepEqual(getActions(), [action]);
    });

    it('resolves request dispatch promise for successful response', async () => {
      const requestAction = {
        type: 'REQUEST',
        request: {},
        meta: { asPromise: true },
      };
      const responseAction = {
        type: success('REQUEST'),
        meta: { requestAction },
      };
      const { dispatch, getActions } = mockStore({});
      const requestResultPromise = dispatch(requestAction);
      const responseResult = dispatch(responseAction);
      assert.instanceOf(requestResultPromise, Promise);
      assert.deepEqual(responseResult, responseAction);
      assert.deepEqual(getActions(), [requestAction, responseAction]);
      const requestResult = await requestResultPromise;
      assert.deepEqual(requestResult, responseAction);
    });

    it('rejects request dispatch promise for error response', async () => {
      const requestAction = {
        type: 'REQUEST',
        request: {},
        meta: { asPromise: true },
      };
      const errorAction = {
        type: error('REQUEST'),
        meta: { requestAction },
      };
      const { dispatch, getActions } = mockStore({});
      const requestResultPromise = dispatch(requestAction);
      const errorResult = dispatch(errorAction);
      assert.instanceOf(requestResultPromise, Promise);
      assert.deepEqual(errorResult, errorAction);
      assert.deepEqual(getActions(), [requestAction, errorAction]);

      let requestResult;

      try {
        await requestResultPromise;
      } catch (e) {
        requestResult = e;
      }

      assert.deepEqual(requestResult, errorAction);
    });

    it('rejects request dispatch promise for abort response', async () => {
      const requestAction = {
        type: 'REQUEST',
        request: {},
        meta: { asPromise: true },
      };
      const abortAction = {
        type: abort('REQUEST'),
        meta: { requestAction },
      };
      const { dispatch, getActions } = mockStore({});
      const requestResultPromise = dispatch(requestAction);
      const abortResult = dispatch(abortAction);
      assert.instanceOf(requestResultPromise, Promise);
      assert.deepEqual(abortResult, abortAction);
      assert.deepEqual(getActions(), [requestAction, abortAction]);

      let requestResult;

      try {
        await requestResultPromise;
      } catch (e) {
        requestResult = e;
      }

      assert.deepEqual(requestResult, abortAction);
    });

    it('handles custom success', async () => {
      const customSuccess = getActionWithSuffix(' success');
      const customMockStore = configureStore([
        requestsPromiseMiddleware({ success: customSuccess }),
      ]);
      const requestAction = {
        type: 'REQUEST',
        request: {},
        meta: { asPromise: true },
      };
      const responseAction = {
        type: customSuccess('REQUEST'),
        meta: { requestAction },
      };
      const { dispatch } = customMockStore({});
      const requestResultPromise = dispatch(requestAction);
      dispatch(responseAction);
      const requestResult = await requestResultPromise;
      assert.deepEqual(requestResult, responseAction);
    });

    it('handles custom getRequestAction', async () => {
      const customMockStore = configureStore([
        requestsPromiseMiddleware({
          getRequestAction: action => action.requestAction || null,
        }),
      ]);
      const requestAction = {
        type: 'REQUEST',
        request: {},
        meta: { asPromise: true },
      };
      const responseAction = {
        type: success('REQUEST'),
        requestAction,
      };
      const { dispatch } = customMockStore({});
      const requestResultPromise = dispatch(requestAction);
      dispatch(responseAction);
      const requestResult = await requestResultPromise;
      assert.deepEqual(requestResult, responseAction);
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
      assert.deepEqual(result, action);
      assert.deepEqual(getActions(), [action]);
    });

    it('promisify dispatch result and passes action for request actions', () => {
      const action = { type: 'REQUEST', request: {} };
      const { dispatch, getActions } = mockStore({});
      const result = dispatch(action);
      assert.instanceOf(result, Promise);
      assert.deepEqual(getActions(), [action]);
    });

    it('resolves request dispatch promise for successful response', async () => {
      const requestAction = { type: 'REQUEST', request: {} };
      const responseAction = {
        type: success('REQUEST'),
        meta: { requestAction },
      };
      const { dispatch, getActions } = mockStore({});
      const requestResultPromise = dispatch(requestAction);
      const responseResult = dispatch(responseAction);
      assert.instanceOf(requestResultPromise, Promise);
      assert.deepEqual(responseResult, responseAction);
      assert.deepEqual(getActions(), [requestAction, responseAction]);
      const requestResult = await requestResultPromise;
      assert.deepEqual(requestResult, responseAction);
    });

    it('rejects request dispatch promise for error response', async () => {
      const requestAction = { type: 'REQUEST', request: {} };
      const errorAction = {
        type: error('REQUEST'),
        meta: { requestAction },
      };
      const { dispatch, getActions } = mockStore({});
      const requestResultPromise = dispatch(requestAction);
      const errorResult = dispatch(errorAction);
      assert.instanceOf(requestResultPromise, Promise);
      assert.deepEqual(errorResult, errorAction);
      assert.deepEqual(getActions(), [requestAction, errorAction]);

      let requestResult;

      try {
        await requestResultPromise;
      } catch (e) {
        requestResult = e;
      }

      assert.deepEqual(requestResult, errorAction);
    });

    it('rejects request dispatch promise for abort response', async () => {
      const requestAction = { type: 'REQUEST', request: {} };
      const abortAction = {
        type: abort('REQUEST'),
        meta: { requestAction },
      };
      const { dispatch, getActions } = mockStore({});
      const requestResultPromise = dispatch(requestAction);
      const abortResult = dispatch(abortAction);
      assert.instanceOf(requestResultPromise, Promise);
      assert.deepEqual(abortResult, abortAction);
      assert.deepEqual(getActions(), [requestAction, abortAction]);

      let requestResult;

      try {
        await requestResultPromise;
      } catch (e) {
        requestResult = e;
      }

      assert.deepEqual(requestResult, abortAction);
    });

    it('handles custom success', async () => {
      const customSuccess = getActionWithSuffix(' success');
      const customMockStore = configureStore([
        requestsPromiseMiddleware({ auto: true, success: customSuccess }),
      ]);
      const requestAction = { type: 'REQUEST', request: {} };
      const responseAction = {
        type: customSuccess('REQUEST'),
        meta: { requestAction },
      };
      const { dispatch } = customMockStore({});
      const requestResultPromise = dispatch(requestAction);
      dispatch(responseAction);
      const requestResult = await requestResultPromise;
      assert.deepEqual(requestResult, responseAction);
    });

    it('handles custom getRequestAction', async () => {
      const customMockStore = configureStore([
        requestsPromiseMiddleware({
          auto: true,
          getRequestAction: action => action.requestAction || null,
        }),
      ]);
      const requestAction = { type: 'REQUEST', request: {} };
      const responseAction = {
        type: success('REQUEST'),
        requestAction,
      };
      const { dispatch } = customMockStore({});
      const requestResultPromise = dispatch(requestAction);
      dispatch(responseAction);
      const requestResult = await requestResultPromise;
      assert.deepEqual(requestResult, responseAction);
    });
  });
});
