import configureStore from 'redux-mock-store';

import { success, error, abort } from './actions';
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
        request: { url: '/' },
        meta: { asPromise: true },
      };
      const { dispatch, getActions } = mockStore({});
      const result = dispatch(action);
      assert.instanceOf(result, Promise);
      assert.deepEqual(getActions(), [action]);
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
      assert.notInstanceOf(requestResult, Promise);
      assert.deepEqual(responseResult, responseAction);
      assert.deepEqual(getActions(), [requestAction, responseAction]);
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
      assert.instanceOf(requestResultPromise, Promise);
      assert.deepEqual(responseResult, responseAction);
      assert.deepEqual(getActions(), [requestAction, responseAction]);
      const requestResult = await requestResultPromise;
      assert.deepEqual(requestResult, responseAction);
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
      const action = { type: 'REQUEST', request: { url: '/' } };
      const { dispatch, getActions } = mockStore({});
      const result = dispatch(action);
      assert.instanceOf(result, Promise);
      assert.deepEqual(getActions(), [action]);
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
      assert.instanceOf(requestResultPromise, Promise);
      assert.deepEqual(responseResult, responseAction);
      assert.deepEqual(getActions(), [requestAction, responseAction]);
      const requestResult = await requestResultPromise;
      assert.deepEqual(requestResult, responseAction);
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
      const requestAction = { type: 'REQUEST', request: { url: '/' } };
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
  });
});
