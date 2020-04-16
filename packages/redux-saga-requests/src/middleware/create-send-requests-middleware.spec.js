import configureStore from 'redux-mock-store';

import defaultConfig from '../default-config';
import {
  createSuccessAction,
  createErrorAction,
  createAbortAction,
  abortRequests,
} from '../actions';
import { createSendRequestsMiddleware } from '.';

const dummyDriver = requestConfig => {
  let aborted = false;

  const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      if (aborted) {
        reject('REQUEST_ABORTED');
      } else if (requestConfig.response) {
        resolve(requestConfig.response);
      } else {
        reject(requestConfig.error);
      }
    }, 10);
  });

  promise.cancel = () => {
    aborted = true;
  };

  return promise;
};

describe('middleware', () => {
  const testConfig = {
    ...defaultConfig,
    driver: dummyDriver,
    isRequestAction: action => !!action.request,
  };
  const mockStore = configureStore([createSendRequestsMiddleware(testConfig)]);

  describe('createSendRequestsMiddleware', () => {
    it('doesnt affect non request actions', () => {
      const action = { type: 'NOT_REQUEST' };
      const { dispatch, getActions } = mockStore({});
      const result = dispatch(action);
      expect(result).toEqual(result);
      expect(getActions()).toEqual([action]);
    });

    it('dispatches requests and resolves on success', async () => {
      const requestAction = {
        type: 'REQUEST',
        request: { response: { data: 'data' } },
      };

      const { dispatch, getActions } = mockStore({});
      const successAction = createSuccessAction(requestAction, {
        data: 'data',
      });
      const result = await dispatch(requestAction);
      expect(result).toEqual({ action: successAction, data: 'data' });
      expect(getActions()).toEqual([requestAction, successAction]);
    });

    it('resolves on success but doesnt dispatch in silent mode', async () => {
      const requestAction = {
        type: 'REQUEST',
        request: { response: { data: 'data' } },
        meta: { silent: true },
      };

      const { dispatch, getActions } = mockStore({});
      const successAction = createSuccessAction(requestAction, {
        data: 'data',
      });
      const result = await dispatch(requestAction);
      expect(result).toEqual({ action: successAction, data: 'data' });
      expect(getActions()).toEqual([]);
    });

    it('dispatches requests and resolves on success for batch request', async () => {
      const requestAction = {
        type: 'REQUEST',
        request: [
          { response: { data: 'data1' } },
          { response: { data: 'data2' } },
        ],
      };

      const { dispatch, getActions } = mockStore({});
      const successAction = createSuccessAction(requestAction, {
        data: ['data1', 'data2'],
      });
      const result = await dispatch(requestAction);
      expect(result).toEqual({
        action: successAction,
        data: ['data1', 'data2'],
      });
      expect(getActions()).toEqual([requestAction, successAction]);
    });

    it('dispatches requests and resolves on success for cache response', async () => {
      const requestAction = {
        type: 'REQUEST',
        request: { response: { data: 'data' } },
        meta: { cacheResponse: { data: 'data cached' } },
      };

      const { dispatch, getActions } = mockStore({});
      const successAction = createSuccessAction(requestAction, {
        data: 'data cached',
      });
      const result = await dispatch(requestAction);
      expect(result).toEqual({ action: successAction, data: 'data cached' });
      expect(getActions()).toEqual([requestAction, successAction]);
    });

    it('dispatches requests and resolves on success for ssr response', async () => {
      const requestAction = {
        type: 'REQUEST',
        request: { response: { data: 'data' } },
        meta: { ssrResponse: { data: 'data ssr' } },
      };

      const { dispatch, getActions } = mockStore({});
      const successAction = createSuccessAction(requestAction, {
        data: 'data ssr',
      });
      const result = await dispatch(requestAction);
      expect(result).toEqual({ action: successAction, data: 'data ssr' });
      expect(getActions()).toEqual([requestAction, successAction]);
    });

    it('dispatches requests and resolves on error', async () => {
      const requestAction = {
        type: 'REQUEST',
        request: { error: 'error' },
      };

      const { dispatch, getActions } = mockStore({});
      const errorAction = createErrorAction(requestAction, 'error');
      const result = dispatch(requestAction);
      await expect(result).resolves.toEqual({
        action: errorAction,
        error: 'error',
      });
      expect(getActions()).toEqual([requestAction, errorAction]);
    });

    it('resolves on error but doesnt dispatch in silent mode', async () => {
      const requestAction = {
        type: 'REQUEST',
        request: { error: 'error' },
        meta: { silent: true },
      };

      const { dispatch, getActions } = mockStore({});
      const errorAction = createErrorAction(requestAction, 'error');
      const result = dispatch(requestAction);
      await expect(result).resolves.toEqual({
        action: errorAction,
        error: 'error',
      });
      expect(getActions()).toEqual([]);
    });

    it('dispatches requests and resolves on abort', async () => {
      const requestAction = {
        type: 'REQUEST',
        request: { response: { data: 'data' } },
        meta: { takeLatest: true },
      };

      const { dispatch, getActions } = mockStore({});
      const successAction = createSuccessAction(requestAction, {
        data: 'data',
      });
      const abortAction = createAbortAction(requestAction);
      const result1 = dispatch(requestAction);
      const result2 = dispatch(requestAction);
      await expect(result1).resolves.toEqual({
        action: abortAction,
        isAborted: true,
      });
      await expect(result2).resolves.toEqual({
        action: successAction,
        data: 'data',
      });
      expect(getActions()).toEqual([
        requestAction,
        requestAction,
        abortAction,
        successAction,
      ]);
    });

    it('aborts all requests on abortRequests action', async () => {
      const requestAction = {
        type: 'REQUEST',
        request: { response: { data: 'data' } },
      };

      const { dispatch, getActions } = mockStore({});
      const abortAction = createAbortAction(requestAction);
      const result1 = dispatch(requestAction);
      const result2 = dispatch(requestAction);
      dispatch(abortRequests());
      await expect(result1).resolves.toEqual({
        action: abortAction,
        isAborted: true,
      });
      await expect(result2).resolves.toEqual({
        action: abortAction,
        isAborted: true,
      });
      expect(getActions()).toEqual([
        requestAction,
        requestAction,
        abortRequests(),
        abortAction,
        abortAction,
      ]);
    });

    it('aborts specific requests on abortRequests action', async () => {
      const requestAction1 = {
        type: 'REQUEST1',
        request: { response: { data: 'data' } },
      };
      const requestAction2 = {
        type: 'REQUEST2',
        request: { response: { data: 'data' } },
      };
      const requestAction3 = {
        type: 'REQUEST3',
        request: { response: { data: 'data' } },
        meta: { requestKey: '1' },
      };

      const { dispatch, getActions } = mockStore({});
      const responseAction1 = createSuccessAction(requestAction1, {
        data: 'data',
      });
      const responseAction2 = createAbortAction(requestAction2);
      const responseAction3 = createAbortAction(requestAction3);
      const result1 = dispatch(requestAction1);
      const result2 = dispatch(requestAction2);
      const result3 = dispatch(requestAction3);
      const abortRequestAction = abortRequests([
        'REQUEST2',
        { requestType: 'REQUEST3', requestKey: '1' },
      ]);
      dispatch(abortRequestAction);
      await expect(result1).resolves.toEqual({
        action: responseAction1,
        data: 'data',
      });
      await expect(result2).resolves.toEqual({
        action: responseAction2,
        isAborted: true,
      });
      await expect(result3).resolves.toEqual({
        action: responseAction3,
        isAborted: true,
      });
      expect(getActions()).toEqual([
        requestAction1,
        requestAction2,
        requestAction3,
        abortRequestAction,
        responseAction1,
        responseAction2,
        responseAction3,
      ]);
    });

    it('supports onRequest interceptor', async () => {
      const onRequestMockStore = configureStore([
        createSendRequestsMiddleware({
          ...testConfig,
          onRequest: (request, action, store) => {
            store.dispatch({ type: 'MAKING_REQUEST' });
            return { response: { data: `${request.response.data}Updated` } };
          },
        }),
      ]);
      const requestAction = {
        type: 'REQUEST',
        request: { response: { data: 'data' } },
      };
      const requestActionUpdated = {
        type: 'REQUEST',
        request: { response: { data: 'dataUpdated' } },
      };

      const { dispatch, getActions } = onRequestMockStore({});
      const successAction = createSuccessAction(requestActionUpdated, {
        data: 'dataUpdated',
      });
      const result = await dispatch(requestAction);
      expect(result).toEqual({ action: successAction, data: 'dataUpdated' });
      expect(getActions()).toEqual([
        { type: 'MAKING_REQUEST' },
        requestActionUpdated,
        successAction,
      ]);
    });

    it('supports onResponse interceptor', async () => {
      const onSuccessMockStore = configureStore([
        createSendRequestsMiddleware({
          ...testConfig,
          onResponse: (response, action, store) => {
            store.dispatch({ type: 'MAKING_RESPONSE' });
            return Promise.resolve({ data: `${response.data}Updated` });
          },
        }),
      ]);
      const requestAction = {
        type: 'REQUEST',
        request: { response: { data: 'data' } },
      };
      const { dispatch, getActions } = onSuccessMockStore({});
      const successAction = createSuccessAction(requestAction, {
        data: 'dataUpdated',
      });
      const result = await dispatch(requestAction);
      expect(result).toEqual({ action: successAction, data: 'dataUpdated' });
      expect(getActions()).toEqual([
        requestAction,
        { type: 'MAKING_RESPONSE' },
        successAction,
      ]);
    });

    it('supports onError interceptor', async () => {
      const onErrorMockStore = configureStore([
        createSendRequestsMiddleware({
          ...testConfig,
          onError: (error, action, store) => {
            store.dispatch({ type: 'MAKING_ERROR' });
            throw `${error}Updated`;
          },
        }),
      ]);
      const requestAction = {
        type: 'REQUEST',
        request: { error: 'error' },
      };
      const { dispatch, getActions } = onErrorMockStore({});
      const errorAction = createErrorAction(requestAction, 'errorUpdated');
      const result = dispatch(requestAction);
      await expect(result).resolves.toEqual({
        action: errorAction,
        error: 'errorUpdated',
      });
      expect(getActions()).toEqual([
        requestAction,
        { type: 'MAKING_ERROR' },
        errorAction,
      ]);
    });

    it('allows error recovery inside onError interceptor', async () => {
      const onErrorMockStore = configureStore([
        createSendRequestsMiddleware({
          ...testConfig,
          onError: async (error, action, store) => {
            const { data } = await store.dispatch({
              type: 'REQUEST',
              request: { response: { data: 'data' } },
              meta: { silent: true },
            });

            return { data };
          },
        }),
      ]);
      const requestAction = {
        type: 'REQUEST',
        request: { error: 'error' },
      };
      const { dispatch, getActions } = onErrorMockStore({});
      const successAction = createSuccessAction(requestAction, {
        data: 'data',
      });
      const result = dispatch(requestAction);
      await expect(result).resolves.toEqual({
        action: successAction,
        data: 'data',
      });
      expect(getActions()).toEqual([requestAction, successAction]);
    });

    it('supports onAbort interceptor', async () => {
      const onErrorMockStore = configureStore([
        createSendRequestsMiddleware({
          ...testConfig,
          onAbort: (action, store) => {
            store.dispatch({ type: 'MAKING_ABORT' });
          },
        }),
      ]);
      const requestAction = {
        type: 'REQUEST',
        request: { error: 'error' },
      };
      const { dispatch, getActions } = onErrorMockStore({});
      const abortAction = createAbortAction(requestAction);
      const result = dispatch(requestAction);
      dispatch(abortRequests());
      await expect(result).resolves.toEqual({
        action: abortAction,
        isAborted: true,
      });
      expect(getActions()).toEqual([
        requestAction,
        abortRequests(),
        { type: 'MAKING_ABORT' },
        abortAction,
      ]);
    });
  });
});
