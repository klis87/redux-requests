import { getContext, setContext, cancelled } from 'redux-saga/effects';
import { expectSaga } from 'redux-saga-test-plan';

import {
  createSuccessAction,
  createErrorAction,
  createAbortAction,
} from './actions';
import {
  REQUESTS_CONFIG,
  INCORRECT_PAYLOAD_ERROR,
  RUN_BY_INTERCEPTOR,
  INTERCEPTORS,
} from './constants';
import {
  defaultConfig,
  createRequestInstance,
  getRequestInstance,
  getRequestsConfig,
  sendRequest,
  cancelSendRequestOnAction,
  watchRequests,
  voidCallback,
} from './sagas';

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
  describe('voidCallback', () => {
    it('returns undefined', () => {
      assert.equal(voidCallback(), undefined);
    });
  });

  describe('defaultConfig', () => {
    it('has correct value', () => {
      const expected = {
        driver: null,
        onRequest: null,
        onSuccess: null,
        onError: null,
        onAbort: null,
      };

      assert.deepEqual(defaultConfig, expected);
    });
  });

  describe('createRequestInstance', () => {
    it('returns correct effect with default config', () => {
      const expected = setContext({
        [REQUESTS_CONFIG]: defaultConfig,
      });
      assert.deepEqual(createRequestInstance(), expected);
    });

    it('returns correct effect with overwritten config', () => {
      const config = {
        driver: 'some driver',
        onRequest: voidCallback,
        onSuccess: voidCallback,
        onError: voidCallback,
        onAbort: voidCallback,
      };

      const expected = setContext({
        [REQUESTS_CONFIG]: config,
      });
      assert.deepEqual(createRequestInstance(config), expected);
    });
  });

  describe('getRequestsConfig', () => {
    it('returns correct effect', () => {
      assert.deepEqual(getRequestsConfig(), getContext(REQUESTS_CONFIG));
    });
  });

  describe('getRequestInstance', () => {
    it('returns correct effect', () => {
      return expectSaga(getRequestInstance)
        .provide([
          [
            getContext(REQUESTS_CONFIG),
            { driver: { requestInstance: 'requestInstance' } },
          ],
        ])
        .returns('requestInstance')
        .run();
    });

    it('handles driver as object', () => {
      return expectSaga(getRequestInstance)
        .provide([
          [
            getContext(REQUESTS_CONFIG),
            {
              driver: {
                default: {
                  requestInstance: 'requestInstance',
                },
              },
            },
          ],
        ])
        .returns('requestInstance')
        .run();
    });

    it('handles not default driver as object', () => {
      return expectSaga(getRequestInstance, 'another')
        .provide([
          [
            getContext(REQUESTS_CONFIG),
            {
              driver: {
                default: { requestInstance: 'requestInstance' },
                another: { requestInstance: 'anotherRequestInstance' },
              },
            },
          ],
        ])
        .returns('anotherRequestInstance')
        .run();
    });
  });

  describe('sendRequest', () => {
    const config = { ...defaultConfig, driver: dummyDriver() };

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

      assert.equal(sagaError, INCORRECT_PAYLOAD_ERROR);
    });

    it('dispatches unwatchable request action when dispatchRequestAction is true', () => {
      const action = { type: 'FETCH', request: { url: '/url' } };

      return expectSaga(sendRequest, action, { dispatchRequestAction: true })
        .provide([[getContext(REQUESTS_CONFIG), config]])
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
        .put(createSuccessAction(action, 'response'))
        .returns({ response: { data: 'response' } })
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
        .put(createSuccessAction(action, 'response'))
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
        .put(createSuccessAction(action, 'response'))
        .returns({ response: { data: 'response' } })
        .run();
    });

    it('dispatches and returns success action for batch requests', () => {
      const action = {
        type: 'FETCH',
        request: [{ url: '/' }, { url: '/path' }],
      };

      return expectSaga(sendRequest, action)
        .provide([[getContext(REQUESTS_CONFIG), config]])
        .put(createSuccessAction(action, ['response', 'response']))
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
            { ...defaultConfig, driver: dummyErrorDriver() },
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
            { ...defaultConfig, driver: dummyErrorDriver() },
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
            { ...defaultConfig, driver: dummyDriver() },
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
            { ...defaultConfig, driver: dummyDriver() },
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

  describe('watchRequests', () => {
    const config = { ...defaultConfig, driver: dummyDriver() };
    const action = { type: 'FETCH', request: { url: '/url' } };

    it('forks sendRequests for request action', () => {
      return expectSaga(watchRequests)
        .provide([[getContext(REQUESTS_CONFIG), config]])
        .fork(sendRequest, action)
        .dispatch(action)
        .silentRun(100);
    });

    it('forks sendRequests for batch request action', () => {
      const batchAction = {
        type: 'FETCH',
        request: [{ url: '/' }, { url: '/path' }],
      };

      return expectSaga(watchRequests)
        .provide([[getContext(REQUESTS_CONFIG), config]])
        .fork(sendRequest, batchAction)
        .dispatch(batchAction)
        .silentRun(100);
    });

    it('doesnt fork sendRequests for not request action', () => {
      return expectSaga(watchRequests)
        .provide([[getContext(REQUESTS_CONFIG), config]])
        .not.fork.fn(sendRequest)
        .dispatch({ type: 'NOT_REQUEST' })
        .silentRun(100);
    });

    it('doesnt fork sendRequests for request action with meta runByWatcher as false', () => {
      return expectSaga(watchRequests)
        .provide([[getContext(REQUESTS_CONFIG), config]])
        .not.fork.fn(sendRequest)
        .dispatch({ ...action, meta: { runByWatcher: false } })
        .silentRun(100);
    });

    it('forks cancelSendRequestOnAction on abort action', () => {
      return expectSaga(watchRequests, { abortOn: 'ABORT' })
        .provide([[getContext(REQUESTS_CONFIG), config]])
        .fork.fn(cancelSendRequestOnAction)
        .dispatch(action)
        .silentRun(100);
    });

    it('cancels request on abort action', () => {
      return expectSaga(watchRequests, { abortOn: 'ABORT' })
        .provide([[getContext(REQUESTS_CONFIG), config]])
        .put.actionType('FETCH_ABORT')
        .dispatch(action)
        .dispatch({ type: 'ABORT' })
        .silentRun(100);
    });

    it('cancels request on abort action defined in action meta', () => {
      return expectSaga(watchRequests)
        .provide([[getContext(REQUESTS_CONFIG), config]])
        .put.actionType('FETCH_ABORT')
        .dispatch({ ...action, meta: { abortOn: 'ABORT' } })
        .dispatch({ type: 'ABORT' })
        .silentRun(100);
    });

    it('doesnt cancel request without abort action', () => {
      return expectSaga(watchRequests, { abortOn: 'ABORT' })
        .provide([[getContext(REQUESTS_CONFIG), config]])
        .not.put.actionType('FETCH_ABORT')
        .dispatch(action)
        .dispatch({ type: 'ACTION' })
        .silentRun(100);
    });

    it('uses takeLatest for get requests', () => {
      return expectSaga(watchRequests)
        .provide([[getContext(REQUESTS_CONFIG), config]])
        .put.actionType('FETCH_ABORT')
        .dispatch(action)
        .dispatch(action)
        .silentRun(100);
    });

    it('uses takeEvery for post requests', () => {
      const postAction = {
        type: 'FETCH',
        request: { url: '/url', method: 'post' },
      };

      return expectSaga(watchRequests)
        .provide([[getContext(REQUESTS_CONFIG), config]])
        .not.put.actionType('FETCH_ABORT')
        .dispatch(postAction)
        .dispatch(postAction)
        .silentRun(100);
    });

    it('allows override takeLatest config', () => {
      return expectSaga(watchRequests, { takeLatest: false })
        .provide([[getContext(REQUESTS_CONFIG), config]])
        .not.put.actionType('FETCH_ABORT')
        .dispatch(action)
        .dispatch(action)
        .silentRun(100);
    });

    it('allows overriding takeLatest per action', () => {
      const actionWithMeta = {
        ...action,
        meta: { takeLatest: false },
      };

      return expectSaga(watchRequests, { takeLatest: true })
        .provide([[getContext(REQUESTS_CONFIG), config]])
        .not.put.actionType('FETCH_ABORT')
        .dispatch(actionWithMeta)
        .dispatch(actionWithMeta)
        .silentRun(100);
    });

    it('respects getLastActionKey override to distinguish actions of the same type', () => {
      return expectSaga(watchRequests, {
        getLastActionKey: a => a.type + a.meta.as,
      })
        .provide([[getContext(REQUESTS_CONFIG), config]])
        .not.put.actionType('FETCH_ABORT')
        .dispatch({
          type: 'FETCH',
          request: { url: '/url' },
          meta: { as: 'version1' },
        })
        .dispatch({
          type: 'FETCH',
          request: { url: '/url' },
          meta: { as: 'version2' },
        })
        .silentRun(100);
    });
  });
});
