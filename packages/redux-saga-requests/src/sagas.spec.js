import {
  getContext,
  setContext,
  fork,
  take,
  cancelled,
} from 'redux-saga/effects';
import { expectSaga } from 'redux-saga-test-plan';
// import { throwError } from 'redux-saga-test-plan/providers';

import {
  success,
  error,
  abort,
  successAction,
  errorAction,
  abortAction,
} from './actions';
import { REQUESTS_CONFIG, INCORRECT_PAYLOAD_ERROR } from './constants';
import {
  defaultConfig,
  createRequestInstance,
  getRequestInstance,
  getRequestsConfig,
  sendRequest,
  watchRequests,
  voidCallback,
} from './sagas';
import { isRequestAction } from './helpers';

const nullback = () => {};

const dummyDriver = requestInstance => ({
  requestInstance,
  getAbortSource() {
    return { token: 'token', cancel: nullback };
  },
  abortRequest(abortSource) {
    abortSource.cancel();
  },
  sendRequest() {
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
        success,
        error,
        abort,
        successAction,
        errorAction,
        abortAction,
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
        success: 'success',
        successAction,
        error: 'error',
        errorAction,
        abort: 'abort',
        abortAction: voidCallback,
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

    it('dispatches request action when dispatchRequestAction is true', () => {
      const action = { type: 'FETCH', request: { url: '/url' } };

      return expectSaga(sendRequest, action, { dispatchRequestAction: true })
        .provide([[getContext(REQUESTS_CONFIG), config]])
        .put(action)
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
        .put({ type: 'FETCH_SUCCESS', ...successAction(action, 'response') })
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
        .put({
          type: 'FETCH_SUCCESS',
          ...successAction(action, ['response', 'response']),
        })
        .returns({ response: [{ data: 'response' }, { data: 'response' }] })
        .run();
    });

    it('doesnt dispatch success action when silent is true', () => {
      const action = { type: 'FETCH', request: { url: '/url' } };

      return expectSaga(sendRequest, action, { silent: true })
        .provide([[getContext(REQUESTS_CONFIG), config]])
        .not.put({
          type: 'FETCH_SUCCESS',
          ...successAction(action, 'response'),
        })
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
        .put({
          type: 'FETCH_ERROR',
          ...errorAction(action, new Error('responseError')),
        })
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
        .not.put({
          type: 'FETCH_ERROR',
          ...errorAction(action, new Error('responseError')),
        })
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
        .put({ type: 'FETCH_ABORT', ...abortAction(action) })
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
        .not.put({ type: 'FETCH_ABORT', ...abortAction(action) })
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

    it('doesnt calls onRequest interceptor when runOnRequest is false', () => {
      const action = { type: 'FETCH', request: { url: '/url' } };
      const onRequest = request => request;

      return expectSaga(sendRequest, action, { runOnRequest: false })
        .provide([[getContext(REQUESTS_CONFIG), { ...config, onRequest }]])
        .not.call(onRequest, action.request, action)
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

    it('doesnt calls onSuccess interceptor when runOnSuccess is false', () => {
      const action = { type: 'FETCH', request: { url: '/url' } };
      const onSuccess = response => response;

      return expectSaga(sendRequest, action, { runOnSuccess: false })
        .provide([[getContext(REQUESTS_CONFIG), { ...config, onSuccess }]])
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
  });

  describe('watchRequests', () => {
    const gen = watchRequests();

    it('waits for a request action', () => {
      assert.deepEqual(gen.next().value, take(isRequestAction));
    });

    it('forks sendRequest', () => {
      const action = { type: 'REQUEST', request: {} };
      assert.deepEqual(gen.next(action).value, fork(sendRequest, action));
    });

    it('waits for another request action', () => {
      assert.deepEqual(gen.next().value, take(isRequestAction));
    });
  });
});
