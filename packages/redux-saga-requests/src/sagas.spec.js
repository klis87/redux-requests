import {
  getContext,
  setContext,
  call,
  put,
  all,
  takeEvery,
  cancelled,
} from 'redux-saga/effects';
import { cloneableGenerator } from 'redux-saga/utils';

import { success, error, abort } from './actions';
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
  isRequestAction,
  abortRequestIfDefined,
  successAction,
  errorAction,
  abortAction,
  voidCallback,
} from './sagas';

// TODO: implement those test with a saga test library
const dummyDriver = {
  getSuccessPayload: () => {},
  getErrorPayload: () => {},
  getRequestHandlers: () => ({
    sendRequest: () => {},
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
        onRequest: voidCallback,
        onSuccess: voidCallback,
        onError: voidCallback,
        onAbort: voidCallback,
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

  describe('abortRequestIfDefined', () => {
    it('returns call effect when abortRequest defined', () => {
      const abortRequest = () => {};
      assert.deepEqual(abortRequestIfDefined(abortRequest), call(abortRequest));
    });

    it('returns null when abortRequest undefined', () => {
      assert.equal(abortRequestIfDefined(undefined), null);
    });
  });

  describe('sendRequest', () => {
    describe('with correct payload with dispatchRequestAction', () => {
      it('dispatches request action', () => {
        const action = { type: 'FETCH', request: { url: '/url' } };
        const gen = sendRequest(action, true);
        gen.next();
        gen.next();
        assert.deepEqual(gen.next().value, put(action));
      });
    });

    describe('with correct payload', () => {
      const config = { ...defaultConfig, driver: dummyDriver };
      const action = {
        type: 'FETCH',
        payload: {
          request: { url: '/url' },
        },
      };
      const gen = cloneableGenerator(sendRequest)(action);
      const requestInstance = () => ({ type: 'axios' });
      const response = { data: 'some response' };
      const requestHandlers = dummyDriver.getRequestHandlers(requestInstance);

      it('gets request instance', () => {
        assert.deepEqual(gen.next().value, getRequestInstance());
      });

      it('gets request config', () => {
        assert.deepEqual(gen.next(requestInstance).value, getRequestsConfig());
      });

      it('gets request handlers', () => {
        const expected = call(
          [dummyDriver, 'getRequestHandlers'],
          requestInstance,
          config,
        );
        assert.deepEqual(gen.next(config).value, expected);
      });

      it('calls onRequest', () => {
        const expected = call(config.onRequest, action.payload.request);
        assert.deepEqual(gen.next(requestHandlers).value, expected);
      });

      it('calls sendRequest', () => {
        const expected = call(
          requestHandlers.sendRequest,
          action.payload.request,
        );
        assert.deepEqual(gen.next().value, expected);
      });

      it('dispatches error, calls on Error and returns request error action when there is an error', () => {
        const errorGen = gen.clone();
        const requestError = new Error('Something went wrong');
        const errorPayload = 'error payload';
        assert.deepEqual(
          errorGen.throw(requestError).value,
          call(dummyDriver.getErrorPayload, requestError),
        );
        const expected = put({
          type: error(action.type),
          payload: errorPayload,
          error: true,
          meta: {
            requestAction: action,
          },
        });
        assert.deepEqual(errorGen.next(errorPayload).value, expected);
        assert.deepEqual(
          errorGen.next(requestHandlers).value,
          call(config.onError, requestError),
        );
        errorGen.next(); // to fire finally yield
        assert.deepEqual(errorGen.next().value, { error: requestError });
      });

      it('dispatches request success action when response is successful', () => {
        assert.deepEqual(
          gen.next(response).value,
          call(dummyDriver.getSuccessPayload, response, action.payload.request),
        );
        const expected = put({
          type: success(action.type),
          payload: {
            data: response.data,
          },
          meta: {
            requestAction: action,
          },
        });
        assert.deepEqual(gen.next(response.data).value, expected);
      });

      it('calls onSuccess', () => {
        const expected = call(config.onSuccess, response);
        assert.deepEqual(gen.next().value, expected);
      });

      it('awaits cancellation', () => {
        assert.deepEqual(gen.next().value, cancelled());
      });

      it('handles cancellation when cancelled', () => {
        assert.deepEqual(
          gen.next(true).value,
          abortRequestIfDefined(requestHandlers.abortRequest),
        );
        const expected = put({
          type: abort(action.type),
          meta: {
            requestAction: action,
          },
        });
        assert.deepEqual(gen.next().value, expected);
        assert.deepEqual(gen.next(requestHandlers).value, call(config.onAbort));
      });

      it('returns response', () => {
        assert.deepEqual(gen.clone().next().value, { response });
      });
    });

    describe('with correct payload with multiple requests', () => {
      const config = { ...defaultConfig, driver: dummyDriver };
      const action = {
        type: 'FETCH_MULTIPLE',
        requests: [{ url: '/url1' }, { url: '/url2' }],
      };
      const gen = sendRequest(action);
      const requestInstance = () => ({ type: 'axios' });
      const responses = [
        { data: 'some response' },
        { data: 'another response' },
      ];
      const requestHandlers = dummyDriver.getRequestHandlers(requestInstance);

      it('gets request instance', () => {
        assert.deepEqual(gen.next().value, getRequestInstance());
      });

      it('gets request config', () => {
        assert.deepEqual(gen.next(requestInstance).value, getRequestsConfig());
      });

      it('gets request handlers', () => {
        const expected = call(
          [dummyDriver, 'getRequestHandlers'],
          requestInstance,
          config,
        );
        assert.deepEqual(gen.next(config).value, expected);
      });

      it('calls onRequest', () => {
        const expected = call(config.onRequest, action.requests);
        assert.deepEqual(gen.next(requestHandlers).value, expected);
      });

      it('calls sendRequests', () => {
        const expected = all([
          call(requestHandlers.sendRequest, action.requests[0]),
          call(requestHandlers.sendRequest, action.requests[1]),
        ]);
        assert.deepEqual(gen.next(requestHandlers).value, expected);
      });

      it('dispatches request success action when reponse is successful', () => {
        assert.deepEqual(
          gen.next(responses).value,
          call(dummyDriver.getSuccessPayload, responses, action.requests),
        );
        const data = [responses[0].data, responses[1].data];
        const expected = put({
          type: success(action.type),
          data,
          meta: {
            requestAction: action,
          },
        });
        assert.deepEqual(gen.next(data).value, expected);
      });

      it('calls onSuccess', () => {
        const expected = call(config.onSuccess, responses);
        assert.deepEqual(gen.next(requestHandlers).value, expected);
      });

      it('returns response array', () => {
        gen.next(); // to fire finally yield
        assert.deepEqual(gen.next().value, { response: responses });
      });
    });

    describe('with incorrect payload', () => {
      it('throws error when action payload is invalid', () => {
        const invalidAction = { type: 'FETCH' };
        const gen = sendRequest(invalidAction);
        assert.throws(() => gen.next(), INCORRECT_PAYLOAD_ERROR);
      });
    });
  });

  describe('watchRequests', () => {
    it('forks sendRequest for every request action', () => {
      const gen = watchRequests();
      assert.deepEqual(
        gen.next().value,
        takeEvery(isRequestAction, sendRequest),
      );
    });
  });
});
