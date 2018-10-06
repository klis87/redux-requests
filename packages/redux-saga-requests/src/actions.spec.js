import {
  success,
  error,
  abort,
  createSuccessAction,
  createErrorAction,
  createAbortAction,
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

  describe('successAction', () => {
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

  describe('errorAction', () => {
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

  describe('abortAction', () => {
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
});
