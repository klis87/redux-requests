import {
  success,
  error,
  abort,
  createSuccessAction,
  createErrorAction,
  createAbortAction,
  getActionPayload,
  isRequestAction,
  getRequestActionFromResponse,
  isSuccessAction,
  isErrorAction,
  isAbortAction,
} from './actions';

describe('actions', () => {
  const SOME_ACTION = 'SOME_ACTION';

  describe('success', () => {
    it('should add success suffix', () => {
      assert.equal(success(SOME_ACTION), `${SOME_ACTION}_SUCCESS`);
    });
  });

  describe('error', () => {
    it('should add error suffix', () => {
      assert.equal(error(SOME_ACTION), `${SOME_ACTION}_ERROR`);
    });
  });

  describe('abort', () => {
    it('should add abort suffix', () => {
      assert.equal(abort(SOME_ACTION), `${SOME_ACTION}_ABORT`);
    });
  });

  describe('createSuccessAction', () => {
    it('should correctly transform action payload', () => {
      const requestAction = {
        type: 'REQUEST',
        request: { url: '/' },
      };

      assert.deepEqual(createSuccessAction(requestAction, 'data'), {
        type: 'REQUEST_SUCCESS',
        data: 'data',
        meta: {
          requestAction,
        },
      });
    });

    it('handles FSA actions', () => {
      const requestAction = {
        type: 'REQUEST',
        payload: {
          request: { url: '/' },
        },
      };

      assert.deepEqual(createSuccessAction(requestAction, 'data'), {
        type: 'REQUEST_SUCCESS',
        payload: {
          data: 'data',
        },
        meta: {
          requestAction,
        },
      });
    });

    it('should merge request meta', () => {
      const requestAction = {
        type: 'REQUEST',
        request: { url: '/' },
        meta: {
          asPromise: true,
        },
      };

      assert.deepEqual(createSuccessAction(requestAction, 'data'), {
        type: 'REQUEST_SUCCESS',
        data: 'data',
        meta: {
          requestAction,
          asPromise: true,
        },
      });
    });
  });

  describe('createErrorAction', () => {
    it('should correctly transform action payload', () => {
      const requestAction = {
        type: 'REQUEST',
        request: { url: '/' },
      };

      assert.deepEqual(createErrorAction(requestAction, 'errorData'), {
        type: 'REQUEST_ERROR',
        error: 'errorData',
        meta: {
          requestAction,
        },
      });
    });

    it('handles FSA actions', () => {
      const requestAction = {
        type: 'REQUEST',
        payload: {
          request: { url: '/' },
        },
      };

      assert.deepEqual(createErrorAction(requestAction, 'errorData'), {
        type: 'REQUEST_ERROR',
        payload: 'errorData',
        error: true,
        meta: {
          requestAction,
        },
      });
    });

    it('should merge request meta', () => {
      const requestAction = {
        type: 'REQUEST',
        request: { url: '/' },
        meta: {
          asPromise: true,
        },
      };

      assert.deepEqual(createErrorAction(requestAction, 'errorData'), {
        type: 'REQUEST_ERROR',
        error: 'errorData',
        meta: {
          requestAction,
          asPromise: true,
        },
      });
    });
  });

  describe('createAbortAction', () => {
    it('should correctly transform action payload', () => {
      const requestAction = {
        type: 'REQUEST',
        request: { url: '/' },
      };

      assert.deepEqual(createAbortAction(requestAction), {
        type: 'REQUEST_ABORT',
        meta: {
          requestAction,
        },
      });
    });

    it('should merge request meta', () => {
      const requestAction = {
        type: 'REQUEST',
        request: { url: '/' },
        meta: {
          asPromise: true,
        },
      };

      assert.deepEqual(createAbortAction(requestAction), {
        type: 'REQUEST_ABORT',
        meta: {
          requestAction,
          asPromise: true,
        },
      });
    });
  });

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
      const responseError = new Error();
      responseError.request = { request: { url: '/' } };
      assert.isFalse(
        isRequestAction({
          type: 'ACTION',
          payload: responseError,
          response: {},
        }),
      );
    });
  });

  describe('getRequestActionFromResponse', () => {
    it('should return request action', () => {
      const requestAction = { type: 'REQUEST', request: { url: '/' } };
      const responseAction = {
        type: success('REQUEST'),
        data: 'data',
        meta: { requestAction },
      };
      assert.deepEqual(
        getRequestActionFromResponse(responseAction),
        requestAction,
      );
    });
  });

  describe('isSuccessAction', () => {
    it('should return true for success action', () => {
      assert.isTrue(
        isSuccessAction({
          type: success('REQUEST'),
          meta: { requestAction: { type: 'REQUEST' } },
        }),
      );
    });

    it('should return false for error action', () => {
      assert.isFalse(
        isSuccessAction({
          type: error('REQUEST'),
          meta: { requestAction: { type: 'REQUEST' } },
        }),
      );
    });
  });

  describe('isErrorAction', () => {
    it('should return true for error action', () => {
      assert.isTrue(
        isErrorAction({
          type: error('REQUEST'),
          meta: { requestAction: { type: 'REQUEST' } },
        }),
      );
    });

    it('should return false for success action', () => {
      assert.isFalse(
        isErrorAction({
          type: success('REQUEST'),
          meta: { requestAction: { type: 'REQUEST' } },
        }),
      );
    });
  });

  describe('isAbortAction', () => {
    it('should return true for abort action', () => {
      assert.isTrue(
        isAbortAction({
          type: abort('REQUEST'),
          meta: { requestAction: { type: 'REQUEST' } },
        }),
      );
    });

    it('should return false for error action', () => {
      assert.isFalse(
        isAbortAction({
          type: error('REQUEST'),
          meta: { requestAction: { type: 'REQUEST' } },
        }),
      );
    });
  });
});
