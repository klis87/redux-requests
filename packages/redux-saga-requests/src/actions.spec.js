import {
  success,
  error,
  abort,
  successAction,
  errorAction,
  abortAction,
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
        request: { url: '/' },
      };

      assert.deepEqual(successAction(requestAction, 'data'), {
        data: 'data',
        meta: {
          requestAction,
        },
      });
    });

    it('handles FSA actions', () => {
      const requestAction = {
        payload: {
          request: { url: '/' },
        },
      };

      assert.deepEqual(successAction(requestAction, 'data'), {
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
        request: { url: '/' },
        meta: {
          asPromise: true,
        },
      };

      assert.deepEqual(successAction(requestAction, 'data'), {
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
        request: { url: '/' },
      };

      assert.deepEqual(errorAction(requestAction, 'errorData'), {
        error: 'errorData',
        meta: {
          requestAction,
        },
      });
    });

    it('handles FSA actions', () => {
      const requestAction = {
        payload: {
          request: { url: '/' },
        },
      };

      assert.deepEqual(errorAction(requestAction, 'errorData'), {
        payload: 'errorData',
        error: true,
        meta: {
          requestAction,
        },
      });
    });

    it('should merge request meta', () => {
      const requestAction = {
        request: { url: '/' },
        meta: {
          asPromise: true,
        },
      };

      assert.deepEqual(errorAction(requestAction, 'errorData'), {
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
        request: { url: '/' },
      };

      assert.deepEqual(abortAction(requestAction), {
        meta: {
          requestAction,
        },
      });
    });

    it('should merge request meta', () => {
      const requestAction = {
        request: { url: '/' },
        meta: {
          asPromise: true,
        },
      };

      assert.deepEqual(abortAction(requestAction), {
        meta: {
          requestAction,
          asPromise: true,
        },
      });
    });
  });
});
