import { getContext, setContext, call, put, all } from 'redux-saga/effects';
import { cloneableGenerator } from 'redux-saga/utils';

import { getRequestInstance, saveRequestInstance, sendRequest } from './sagas';
import { success, error } from './actions';
import { REQUEST_INSTANCE, INCORRECT_PAYLOAD_ERROR } from './constants';

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

  describe('sendRequest', () => {
    describe('with correct payload', () => {
      const action = { type: 'FETCH', request: { url: '/url' } };
      const gen = cloneableGenerator(sendRequest)(action);
      const requestInstance = () => ({ type: 'axios' });
      const response = { data: 'some response' };

      it('gets request instance', () => {
        assert.deepEqual(gen.next().value, call(getRequestInstance));
      });

      it('dispatches request action', () => {
        assert.deepEqual(gen.next(requestInstance).value, put(action));
      });

      it('calls requestInstance', () => {
        assert.deepEqual(gen.next().value, call(requestInstance, action.request));
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
        const actual = gen.next();
        assert.deepEqual(actual.value, response);
        assert.isTrue(actual.done);
      });
    });

    describe('with correct payload with multiple requests', () => {
      const action = { type: 'FETCH_MULTIPLE', requests: [{ url: '/url1' }, { url: '/url2' }] };
      const gen = sendRequest(action);
      const requestInstance = () => ({ type: 'axios' });
      const responses = [{ data: 'some response' }, { data: 'another response' }];

      it('gets request instance', () => {
        assert.deepEqual(gen.next().value, call(getRequestInstance));
      });

      it('dispatches request action', () => {
        assert.deepEqual(gen.next(requestInstance).value, put(action));
      });

      it('calls requestInstance', () => {
        const expected = all([
          call(requestInstance, action.requests[0]),
          call(requestInstance, action.requests[1]),
        ]);
        assert.deepEqual(gen.next().value, expected);
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
        const actual = gen.next();
        assert.deepEqual(actual.value, responses);
        assert.isTrue(actual.done);
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
});
