import { getContext, setContext, call, put, all, takeEvery, cancelled } from 'redux-saga/effects';
import { cloneableGenerator } from 'redux-saga/utils';

import { success, error, abort } from './actions';
import { REQUEST_INSTANCE, INCORRECT_PAYLOAD_ERROR } from './constants';
import {
  getRequestInstance,
  saveRequestInstance,
  sendRequest,
  getTokenSource,
  cancelTokenSource,
  watchRequests,
  isRequestAction,
} from './sagas';

describe('sagas', () => {
  describe('saveRequestInstance', () => {
    it('returns correct effect', () => {
      assert.deepEqual(saveRequestInstance({}), setContext({ [REQUEST_INSTANCE]: {} }));
    });
  });

  describe('getRequestInstance', () => {
    it('returns correct effect', () => {
      assert.deepEqual(getRequestInstance({}), getContext(REQUEST_INSTANCE));
    });
  });

  describe('getTokenSource', () => {
    it('calls requestInstance.CancelToken.source', () => {
      const requestInstance = {
        CancelToken: { source: () => {} },
      };
      assert.deepEqual(getTokenSource(requestInstance), call([requestInstance.CancelToken, 'source']));
    });
  });

  describe('cancelTokenSource', () => {
    it('calls tokenSource.cancel', () => {
      const tokenSource = { cancel: () => {} };
      assert.deepEqual(cancelTokenSource(tokenSource), call([tokenSource, 'cancel']));
    });
  });

  describe('sendRequest', () => {
    describe('with correct payload', () => {
      const action = { type: 'FETCH', request: { url: '/url' } };
      const gen = cloneableGenerator(sendRequest)(action);
      const requestInstance = () => ({ type: 'axios' });
      requestInstance.CancelToken = { source: () => {} };
      const response = { data: 'some response' };
      const tokenSource = { token: 'token', cancel: () => {} };

      it('gets request instance', () => {
        assert.deepEqual(gen.next().value, getRequestInstance());
      });

      it('dispatches request action', () => {
        assert.deepEqual(gen.next(requestInstance).value, put(action));
      });

      it('calls getTokenSource', () => {
        assert.deepEqual(gen.next().value, getTokenSource(requestInstance));
      });

      it('calls requestInstance', () => {
        const expected = call(requestInstance, { ...action.request, cancelToken: tokenSource.token });
        assert.deepEqual(gen.next(tokenSource).value, expected);
      });

      it('dispatches and returns request error action when there is an error', () => {
        const errorGen = gen.clone();
        const requestError = new Error('Something went wrong');
        const expected = put({
          type: error`${action.type}`,
          payload: {
            error: requestError,
            meta: action,
          },
        });

        assert.deepEqual(errorGen.throw(requestError).value, expected);
        assert.deepEqual(errorGen.next().value, { error: requestError });
      });

      it('dispatches request success action when reponse is successful', () => {
        const expected = put({
          type: success`${action.type}`,
          payload: {
            data: response.data,
            meta: action,
          },
        });
        assert.deepEqual(gen.next(response).value, expected);
      });

      it('returns response', () => {
        assert.deepEqual(gen.next().value, response);
      });

      it('awaits cancellation', () => {
        assert.deepEqual(gen.next().value, cancelled());
      });

      it('ignores cancellation login when not cancelled', () => {
        assert.deepEqual(gen.clone().next(), { done: true, value: undefined });
      });

      it('handles cancellation when cancelled', () => {
        assert.deepEqual(gen.next(true).value, cancelTokenSource(tokenSource));
        assert.deepEqual(gen.next().value, put({ type: abort`${action.type}` }));
      });
    });

    describe('with correct payload with multiple requests', () => {
      const action = { type: 'FETCH_MULTIPLE', requests: [{ url: '/url1' }, { url: '/url2' }] };
      const gen = sendRequest(action);
      const requestInstance = () => ({ type: 'axios' });
      requestInstance.CancelToken = { source: () => {} };
      const responses = [{ data: 'some response' }, { data: 'another response' }];
      const tokenSource = { token: 'token' };

      it('gets request instance', () => {
        assert.deepEqual(gen.next().value, getRequestInstance());
      });

      it('dispatches request action', () => {
        assert.deepEqual(gen.next(requestInstance).value, put(action));
      });

      it('calls getTokenSource', () => {
        assert.deepEqual(gen.next().value, getTokenSource(requestInstance));
      });

      it('calls requestInstance', () => {
        const expected = all([
          call(requestInstance, { ...action.requests[0], cancelToken: tokenSource.token }),
          call(requestInstance, { ...action.requests[1], cancelToken: tokenSource.token }),
        ]);
        assert.deepEqual(gen.next(tokenSource).value, expected);
      });

      it('dispatches request success action when reponse is successful', () => {
        const expected = put({
          type: success`${action.type}`,
          payload: {
            data: [responses[0].data, responses[1].data],
            meta: action,
          },
        });
        assert.deepEqual(gen.next(responses).value, expected);
      });

      it('returns response array', () => {
        assert.deepEqual(gen.next().value, responses);
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
      assert.deepEqual(gen.next().value, takeEvery(isRequestAction, sendRequest));
    });
  });
});
