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
import {
  REQUEST_INSTANCE,
  REQUESTS_CONFIG,
  INCORRECT_PAYLOAD_ERROR,
} from './constants';
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

const dummyDriver = {
  getSuccessPayload: response => response.data,
  getErrorPayload: () => {},
  getRequestHandlers: () => ({
    sendRequest: () => ({ data: 'response' }),
    abortRequest: () => {},
  }),
};

const dummyErrorDriver = {
  getSuccessPayload: response => response.data,
  getErrorPayload: e => e,
  getRequestHandlers: () => ({
    sendRequest: () => {
      throw new Error('responseError');
    },
    abortRequest: () => {},
  }),
};

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
    const requestInstance = { type: 'axios' };

    it('returns correct effect with default config', () => {
      const expected = setContext({
        [REQUEST_INSTANCE]: requestInstance,
        [REQUESTS_CONFIG]: defaultConfig,
      });
      assert.deepEqual(createRequestInstance(requestInstance), expected);
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
        [REQUEST_INSTANCE]: requestInstance,
        [REQUESTS_CONFIG]: config,
      });
      assert.deepEqual(
        createRequestInstance(requestInstance, config),
        expected,
      );
    });
  });

  describe('getRequestInstance', () => {
    it('returns correct effect', () => {
      assert.deepEqual(getRequestInstance(), getContext(REQUEST_INSTANCE));
    });
  });

  describe('getRequestsConfig', () => {
    it('returns correct effect', () => {
      assert.deepEqual(getRequestsConfig(), getContext(REQUESTS_CONFIG));
    });
  });

  describe('sendRequest', () => {
    const config = { ...defaultConfig, driver: dummyDriver };

    it('throws when request action is of incorrect type', () => {
      const action = { type: 'TYPE' };
      let sagaError;

      try {
        expectSaga(sendRequest, action)
          .put(action)
          .run();
      } catch (e) {
        sagaError = e.message;
      }

      assert.equal(sagaError, INCORRECT_PAYLOAD_ERROR);
    });

    it('dispatches request action when dispatchRequestAction as true', () => {
      const action = { type: 'FETCH', request: { url: '/url' } };

      return expectSaga(sendRequest, action, { dispatchRequestAction: true })
        .provide([[getContext(REQUESTS_CONFIG), config]])
        .put(action)
        .run();
    });

    it('doesnt dispatch request action when dispatchRequestAction as false', () => {
      const action = { type: 'FETCH', request: { url: '/url' } };

      return expectSaga(sendRequest, action, { dispatchRequestAction: false })
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

    it('dispatches and returns error action on error', () => {
      const action = { type: 'FETCH', request: { url: '/url' } };

      return expectSaga(sendRequest, action)
        .provide([
          [
            getContext(REQUESTS_CONFIG),
            { ...defaultConfig, driver: dummyErrorDriver },
          ],
        ])
        .put({
          type: 'FETCH_ERROR',
          ...errorAction(action, new Error('responseError')),
        })
        .returns({ error: new Error('responseError') })
        .run();
    });

    it('dispatches abort action on cancellation', () => {
      const action = { type: 'FETCH', request: { url: '/url' } };

      return expectSaga(sendRequest, action)
        .provide([
          [
            getContext(REQUESTS_CONFIG),
            { ...defaultConfig, driver: dummyDriver },
          ],
          [cancelled(), true],
        ])
        .put({ type: 'FETCH_ABORT', ...abortAction(action) })
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
