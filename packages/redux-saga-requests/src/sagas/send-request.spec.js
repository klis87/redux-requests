import { getContext, cancelled } from 'redux-saga/effects';
import { expectSaga } from 'redux-saga-test-plan';
import * as matchers from 'redux-saga-test-plan/matchers';

import {
  createSuccessAction,
  createErrorAction,
  createAbortAction,
} from '../actions';
import {
  REQUESTS_CONFIG,
  INCORRECT_PAYLOAD_ERROR,
  RUN_BY_INTERCEPTOR,
  INTERCEPTORS,
} from '../constants';
import { defaultRequestInstanceConfig } from './create-request-instance';
import sendRequest from './send-request';

const nullback = () => {};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const dummyDriver = requestInstance => ({
  requestInstance,
  getAbortSource() {
    return { token: 'token', cancel: nullback };
  },
  abortRequest(abortSource) {
    abortSource.cancel();
  },
  async sendRequest() {
    await sleep(0); // necessary to test cancelled tasks in watch requests
    return { data: 'response' };
  },
  getSuccessPayload(response) {
    if (Array.isArray(response)) {
      return response.map(r => r.data);
    }

    return response.data;
  },
  getErrorPayload(e) {
    return e;
  },
});

const dummyErrorDriver = requestInstance => ({
  requestInstance,
  getAbortSource() {
    return { token: 'token', cancel: nullback };
  },
  abortRequest(abortSource) {
    abortSource.cancel();
  },
  sendRequest() {
    throw new Error('responseError');
  },
  getSuccessPayload(response) {
    return response.data;
  },
  getErrorPayload(e) {
    return e;
  },
});

describe('sagas', () => {
  describe('sendRequest', () => {
    const config = { ...defaultRequestInstanceConfig, driver: dummyDriver() };

    it('throws when request action is of incorrect type', async () => {
      const action = { type: 'TYPE' };
      let sagaError;

      try {
        await expectSaga(sendRequest, action)
          .provide([[getContext(REQUESTS_CONFIG), config]])
          .run();
      } catch (e) {
        sagaError = e.message;
      }

      expect(sagaError).toEqual(INCORRECT_PAYLOAD_ERROR);
    });

    it('gets response from cache when available in meta cacheResponse', () => {
      const action = {
        type: 'FETCH',
        request: { url: '/url' },
        meta: { cache: 1 },
      };

      const actionWithCacheResponse = {
        ...action,
        meta: { ...action.meta, cacheResponse: { data: 'data' } },
      };

      return expectSaga(sendRequest, action, { dispatchRequestAction: true })
        .provide([
          [getContext(REQUESTS_CONFIG), config],
          [matchers.put.actionType(action.type), actionWithCacheResponse],
        ])
        .put(
          createSuccessAction(actionWithCacheResponse, 'data', {
            data: 'data',
          }),
        )
        .run();
    });

    it('dispatches unwatchable request action when dispatchRequestAction is true', () => {
      const action = { type: 'FETCH', request: { url: '/url' } };

      return expectSaga(sendRequest, action, { dispatchRequestAction: true })
        .provide([
          [getContext(REQUESTS_CONFIG), config],
          [matchers.put.actionType(action.type), action],
        ])
        .put({
          type: 'FETCH',
          request: { url: '/url' },
          meta: { runByWatcher: false },
        })
        .run();
    });

    it('doesnt dispatch request action when dispatchRequestAction is false', () => {
      const action = { type: 'FETCH', request: { url: '/url' } };

      return expectSaga(sendRequest, action, { dispatchRequestAction: false })
        .provide([[getContext(REQUESTS_CONFIG), config]])
        .not.put(action)
        .run();
    });

    it('doesnt dispatch request action when silent is true', () => {
      const action = { type: 'FETCH', request: { url: '/url' } };

      return expectSaga(sendRequest, action, {
        dispatchRequestAction: true,
        silent: true,
      })
        .provide([[getContext(REQUESTS_CONFIG), config]])
        .not.put(action)
        .run();
    });

    it('dispatches and returns success action', () => {
      const action = { type: 'FETCH', request: { url: '/url' } };

      return expectSaga(sendRequest, action)
        .provide([[getContext(REQUESTS_CONFIG), config]])
        .put(createSuccessAction(action, 'response', { data: 'response' }))
        .returns({ response: { data: 'response' } })
        .run();
    });

    it('returns serverSide true when request action dispatch returns null', () => {
      const action = { type: 'FETCH', request: { url: '/url' } };

      return expectSaga(sendRequest, action, { dispatchRequestAction: true })
        .provide([
          [getContext(REQUESTS_CONFIG), config],
          [matchers.put.actionType(action.type), null],
        ])
        .not.put(createSuccessAction(action, 'response', { data: 'response' }))
        .returns({ serverSide: true })
        .run();
    });

    it('uses default driver from driver config object', () => {
      const action = { type: 'FETCH', request: { url: '/url' } };

      return expectSaga(sendRequest, action)
        .provide([
          [
            getContext(REQUESTS_CONFIG),
            { ...config, driver: { default: dummyDriver() } },
          ],
        ])
        .put(createSuccessAction(action, 'response', { data: 'response' }))
        .returns({ response: { data: 'response' } })
        .run();
    });

    it('uses not default driver when defined in action meta driver', () => {
      const action = {
        type: 'FETCH',
        request: { url: '/url' },
        meta: { driver: 'another' },
      };

      return expectSaga(sendRequest, action)
        .provide([
          [
            getContext(REQUESTS_CONFIG),
            {
              ...config,
              driver: { default: dummyErrorDriver(), another: dummyDriver() },
            },
          ],
        ])
        .put(createSuccessAction(action, 'response', { data: 'response' }))
        .returns({ response: { data: 'response' } })
        .run();
    });

    it('dispatches and returns success action for batch requests', () => {
      const action = {
        type: 'FETCH',
        request: [{ url: '/' }, { url: '/path' }],
      };

      return expectSaga(sendRequest, action)
        .provide([
          [getContext(REQUESTS_CONFIG), config],
          [matchers.put.actionType(action.type), action],
        ])
        .put(
          createSuccessAction(
            action,
            ['response', 'response'],
            [{ data: 'response' }, { data: 'response' }],
          ),
        )
        .returns({ response: [{ data: 'response' }, { data: 'response' }] })
        .run();
    });

    it('doesnt dispatch success action when silent is true', () => {
      const action = { type: 'FETCH', request: { url: '/url' } };

      return expectSaga(sendRequest, action, { silent: true })
        .provide([[getContext(REQUESTS_CONFIG), config]])
        .not.put(createSuccessAction(action, 'response'))
        .run();
    });

    it('dispatches and returns error action on error', () => {
      const action = { type: 'FETCH', request: { url: '/url' } };

      return expectSaga(sendRequest, action)
        .provide([
          [
            getContext(REQUESTS_CONFIG),
            { ...defaultRequestInstanceConfig, driver: dummyErrorDriver() },
          ],
        ])
        .put(createErrorAction(action, new Error('responseError')))
        .returns({ error: new Error('responseError') })
        .run();
    });

    it('doesnt dispatch error action on error when silent is true', () => {
      const action = { type: 'FETCH', request: { url: '/url' } };

      return expectSaga(sendRequest, action, { silent: true })
        .provide([
          [
            getContext(REQUESTS_CONFIG),
            { ...defaultRequestInstanceConfig, driver: dummyErrorDriver() },
          ],
        ])
        .not.put(createErrorAction(action, new Error('responseError')))
        .run();
    });

    it('dispatches abort action on cancellation', () => {
      const action = { type: 'FETCH', request: { url: '/url' } };

      return expectSaga(sendRequest, action)
        .provide([
          [
            getContext(REQUESTS_CONFIG),
            { ...defaultRequestInstanceConfig, driver: dummyDriver() },
          ],
          [cancelled(), true],
        ])
        .put(createAbortAction(action))
        .run();
    });

    it('doesnt dispatch abort action on cancellation when silent is true', () => {
      const action = { type: 'FETCH', request: { url: '/url' } };

      return expectSaga(sendRequest, action, { silent: true })
        .provide([
          [
            getContext(REQUESTS_CONFIG),
            { ...defaultRequestInstanceConfig, driver: dummyDriver() },
          ],
          [cancelled(), true],
        ])
        .not.put(createAbortAction(action))
        .run();
    });

    it('calls onRequest interceptor when defined', () => {
      const action = { type: 'FETCH', request: { url: '/url' } };
      const onRequest = request => request;

      return expectSaga(sendRequest, action)
        .provide([[getContext(REQUESTS_CONFIG), { ...config, onRequest }]])
        .call(onRequest, action.request, action)
        .run();
    });

    it('doesnt call onRequest interceptor when runOnRequest is false', () => {
      const action = { type: 'FETCH', request: { url: '/url' } };
      const onRequest = request => request;

      return expectSaga(sendRequest, action, { runOnRequest: false })
        .provide([[getContext(REQUESTS_CONFIG), { ...config, onRequest }]])
        .not.call(onRequest, action.request, action)
        .run();
    });

    it('doesnt call onRequest interceptor when run by another onRequest interceptor', () => {
      const action = { type: 'FETCH', request: { url: '/url' } };
      const onRequest = request => request;

      return expectSaga(sendRequest, action)
        .provide([
          [getContext(REQUESTS_CONFIG), { ...config, onRequest }],
          [getContext(RUN_BY_INTERCEPTOR), INTERCEPTORS.ON_REQUEST],
        ])
        .not.call(onRequest, action.request, action)
        .run();
    });

    it('calls onRequest interceptor when run by another onRequest interceptor when runOnRequest is true', () => {
      const action = { type: 'FETCH', request: { url: '/url' } };
      const onRequest = request => request;

      return expectSaga(sendRequest, action, { runOnRequest: true })
        .provide([
          [getContext(REQUESTS_CONFIG), { ...config, onRequest }],
          [getContext(RUN_BY_INTERCEPTOR), INTERCEPTORS.ON_REQUEST],
        ])
        .call(onRequest, action.request, action)
        .run();
    });

    it('calls onSuccess interceptor when defined', () => {
      const action = { type: 'FETCH', request: { url: '/url' } };
      const onSuccess = response => response;

      return expectSaga(sendRequest, action)
        .provide([[getContext(REQUESTS_CONFIG), { ...config, onSuccess }]])
        .call(onSuccess, { data: 'response' }, action)
        .run();
    });

    it('doesnt call onSuccess interceptor when runOnSuccess is false', () => {
      const action = { type: 'FETCH', request: { url: '/url' } };
      const onSuccess = response => response;

      return expectSaga(sendRequest, action, { runOnSuccess: false })
        .provide([[getContext(REQUESTS_CONFIG), { ...config, onSuccess }]])
        .not.call(onSuccess, { data: 'response' }, action)
        .run();
    });

    it('doesnt call onSuccess interceptor when run by another onSuccess interceptor', () => {
      const action = { type: 'FETCH', request: { url: '/url' } };
      const onSuccess = response => response;

      return expectSaga(sendRequest, action)
        .provide([
          [getContext(REQUESTS_CONFIG), { ...config, onSuccess }],
          [getContext(RUN_BY_INTERCEPTOR), INTERCEPTORS.ON_SUCCESS],
        ])
        .not.call(onSuccess, { data: 'response' }, action)
        .run();
    });

    it('doesnt call onSuccess interceptor when run by onError interceptor', () => {
      const action = { type: 'FETCH', request: { url: '/url' } };
      const onSuccess = response => response;

      return expectSaga(sendRequest, action)
        .provide([
          [getContext(REQUESTS_CONFIG), { ...config, onSuccess }],
          [getContext(RUN_BY_INTERCEPTOR), INTERCEPTORS.ON_ERROR],
        ])
        .not.call(onSuccess, { data: 'response' }, action)
        .run();
    });

    it('calls onError interceptor when defined', () => {
      const action = { type: 'FETCH', request: { url: '/url' } };
      const onError = e => ({ error: e });

      return expectSaga(sendRequest, action)
        .provide([
          [
            getContext(REQUESTS_CONFIG),
            { ...config, onError, driver: dummyErrorDriver() },
          ],
        ])
        .call(onError, new Error('responseError'), action)
        .run();
    });

    it('doesnt call onError when runOnError is false', () => {
      const action = { type: 'FETCH', request: { url: '/url' } };
      const onError = e => ({ error: e });

      return expectSaga(sendRequest, action, { runOnError: false })
        .provide([
          [
            getContext(REQUESTS_CONFIG),
            { ...config, onError, driver: dummyErrorDriver() },
          ],
        ])
        .not.call(onError, new Error('responseError'), action)
        .run();
    });

    it('doesnt call onSuccess when onError doesnt catch error', () => {
      const action = { type: 'FETCH', request: { url: '/url' } };
      const onError = e => ({ error: e });
      const onSuccess = response => response;

      return expectSaga(sendRequest, action)
        .provide([
          [
            getContext(REQUESTS_CONFIG),
            { ...config, onError, onSuccess, driver: dummyErrorDriver() },
          ],
        ])
        .not.call.fn(onSuccess)
        .run();
    });

    it('calls onSuccess when onError catches error', () => {
      const action = { type: 'FETCH', request: { url: '/url' } };
      const onError = () => ({ response: { data: 'response' } });
      const onSuccess = response => response;

      return expectSaga(sendRequest, action)
        .provide([
          [
            getContext(REQUESTS_CONFIG),
            { ...config, onError, onSuccess, driver: dummyErrorDriver() },
          ],
        ])
        .call(onSuccess, { data: 'response' }, action)
        .run();
    });

    it('calls onAbort interceptor when defined', () => {
      const action = { type: 'FETCH', request: { url: '/url' } };
      const onAbort = () => {};

      return expectSaga(sendRequest, action)
        .provide([
          [getContext(REQUESTS_CONFIG), { ...config, onAbort }],
          [cancelled(), true],
        ])
        .call(onAbort, action)
        .run();
    });

    it('doesnt call onAbort interceptor when runOnAbort is false', () => {
      const action = { type: 'FETCH', request: { url: '/url' } };
      const onAbort = () => {};

      return expectSaga(sendRequest, action, { runOnAbort: false })
        .provide([
          [getContext(REQUESTS_CONFIG), { ...config, onAbort }],
          [cancelled(), true],
        ])
        .not.call(onAbort, action)
        .run();
    });

    it('doesnt call onAbort interceptor when run by onAbort interceptor', () => {
      const action = { type: 'FETCH', request: { url: '/url' } };
      const onAbort = () => {};

      return expectSaga(sendRequest, action)
        .provide([
          [getContext(REQUESTS_CONFIG), { ...config, onAbort }],
          [getContext(RUN_BY_INTERCEPTOR), INTERCEPTORS.ON_ABORT],
          [cancelled(), true],
        ])
        .not.call(onAbort, action)
        .run();
    });
  });
});
