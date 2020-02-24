import configureStore from 'redux-mock-store';

import defaultConfig from '../default-config';
import { success, error, abort } from '../actions';
import { createRequestsPromiseMiddleware } from '.';

describe('middleware', () => {
  describe('createRequestsPromiseMiddleware', () => {
    describe('withoutAutoMode', () => {
      const mockStore = configureStore([createRequestsPromiseMiddleware()]);

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
        createRequestsPromiseMiddleware({
          ...defaultConfig,
          autoPromisify: true,
        }),
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
});
