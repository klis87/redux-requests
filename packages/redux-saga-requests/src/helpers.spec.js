import { getActionPayload, isRequestAction, mapRequest } from './helpers';

describe('helpers', () => {
  describe('getActionPayload', () => {
    it('just returns not FSA action', () => {
      const action = { type: 'ACTION' };
      assert.deepEqual(getActionPayload(action), action);
    });

    it('returns payload of FSA action', () => {
      const action = { type: 'ACTION', payload: 'payload' };
      assert.deepEqual(getActionPayload(action), 'payload');
    });
  });

  describe('isRequestAction', () => {
    it('recognizes request action', () => {
      assert.isTrue(isRequestAction({ type: 'ACTION', request: { url: '/' } }));
    });

    it('recognizes request FSA action', () => {
      assert.isTrue(
        isRequestAction({
          type: 'ACTION',
          payload: { request: { url: '/' } },
        }),
      );
    });

    it('recognizes request action with multiple requests', () => {
      assert.isTrue(
        isRequestAction({
          type: 'ACTION',
          request: [{ url: '/' }, { url: '/path' }],
        }),
      );
    });

    it('rejects actions without request object', () => {
      assert.isFalse(
        isRequestAction({
          type: 'ACTION',
          attr: 'value',
        }),
      );
    });

    it('rejects actions with request without url', () => {
      assert.isFalse(
        isRequestAction({
          type: 'ACTION',
          request: { headers: {} },
        }),
      );
    });

    it('rejects actions with response object', () => {
      assert.isFalse(
        isRequestAction({
          type: 'ACTION',
          request: { url: '/' },
          response: {},
        }),
      );
    });

    it('rejects actions with payload which is instance of error', () => {
      const error = new Error();
      error.request = { request: { url: '/' } };
      assert.isFalse(
        isRequestAction({
          type: 'ACTION',
          payload: error,
          response: {},
        }),
      );
    });
  });

  describe('mapRequest', () => {
    const addBody = request => ({ ...request, body: { x: 1 } });

    it('maps single request', () => {
      assert.deepEqual(mapRequest({ url: '/' }, addBody), {
        url: '/',
        body: { x: 1 },
      });
    });

    it('maps multiple requests', () => {
      assert.deepEqual(mapRequest([{ url: '/' }, { url: '/path' }], addBody), [
        {
          url: '/',
          body: { x: 1 },
        },
        {
          url: '/path',
          body: { x: 1 },
        },
      ]);
    });
  });
});
