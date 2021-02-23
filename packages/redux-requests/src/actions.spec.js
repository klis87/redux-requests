import {
  success,
  error,
  abort,
  createSuccessAction,
  createErrorAction,
  createAbortAction,
  isRequestAction,
  getRequestActionFromResponse,
  isSuccessAction,
  isErrorAction,
  isAbortAction,
  isRequestActionQuery,
} from './actions';

describe('actions', () => {
  const SOME_ACTION = 'SOME_ACTION';

  describe('success', () => {
    it('should add success suffix', () => {
      expect(success(SOME_ACTION)).toBe(`${SOME_ACTION}_SUCCESS`);
    });
  });

  describe('error', () => {
    it('should add error suffix', () => {
      expect(error(SOME_ACTION)).toBe(`${SOME_ACTION}_ERROR`);
    });
  });

  describe('abort', () => {
    it('should add abort suffix', () => {
      expect(abort(SOME_ACTION)).toBe(`${SOME_ACTION}_ABORT`);
    });
  });

  describe('createSuccessAction', () => {
    it('should correctly transform action payload', () => {
      const requestAction = {
        type: 'REQUEST',
        request: { url: '/' },
      };

      expect(createSuccessAction(requestAction, { data: 'data' })).toEqual({
        type: 'REQUEST_SUCCESS',
        response: { data: 'data' },
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
          asQuery: true,
        },
      };

      expect(createSuccessAction(requestAction, { data: 'data' })).toEqual({
        type: 'REQUEST_SUCCESS',
        response: { data: 'data' },
        meta: {
          requestAction,
          asQuery: true,
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

      expect(createErrorAction(requestAction, 'errorData')).toEqual({
        type: 'REQUEST_ERROR',
        error: 'errorData',
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
          asQuery: true,
        },
      };

      expect(createErrorAction(requestAction, 'errorData')).toEqual({
        type: 'REQUEST_ERROR',
        error: 'errorData',
        meta: {
          requestAction,
          asQuery: true,
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

      expect(createAbortAction(requestAction)).toEqual({
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
          asQuery: true,
        },
      };

      expect(createAbortAction(requestAction)).toEqual({
        type: 'REQUEST_ABORT',
        meta: {
          requestAction,
          asQuery: true,
        },
      });
    });
  });

  describe('isRequestAction', () => {
    it('recognizes request action', () => {
      expect(isRequestAction({ type: 'ACTION', request: { url: '/' } })).toBe(
        true,
      );
    });

    it('recognizes request action with multiple requests', () => {
      expect(
        isRequestAction({
          type: 'ACTION',
          request: [{ url: '/' }, { url: '/path' }],
        }),
      ).toBe(true);
    });

    it('recognizes request action with graphql query', () => {
      expect(
        isRequestAction({
          type: 'ACTION',
          request: { query: '{ x }' },
        }),
      ).toBe(true);
    });

    it('rejects actions without request object', () => {
      expect(
        isRequestAction({
          type: 'ACTION',
          attr: 'value',
        }),
      ).toBe(false);
    });

    it('rejects actions with request without url', () => {
      expect(
        isRequestAction({
          type: 'ACTION',
          request: { headers: {} },
        }),
      ).toBe(false);
    });

    it('rejects actions with response object', () => {
      expect(
        isRequestAction({
          type: 'ACTION',
          request: { url: '/' },
          response: {},
        }),
      ).toBe(false);
    });

    it('rejects actions with payload which is instance of error', () => {
      const responseError = new Error();
      responseError.request = { request: { url: '/' } };
      expect(
        isRequestAction({
          type: 'ACTION',
          payload: responseError,
          response: {},
        }),
      ).toBe(false);
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
      expect(getRequestActionFromResponse(responseAction)).toEqual(
        requestAction,
      );
    });
  });

  describe('isSuccessAction', () => {
    it('should return true for success action', () => {
      expect(
        isSuccessAction({
          type: success('REQUEST'),
          meta: { requestAction: { type: 'REQUEST' } },
        }),
      ).toBe(true);
    });

    it('should return false for error action', () => {
      expect(
        isSuccessAction({
          type: error('REQUEST'),
          meta: { requestAction: { type: 'REQUEST' } },
        }),
      ).toBe(false);
    });
  });

  describe('isErrorAction', () => {
    it('should return true for error action', () => {
      expect(
        isErrorAction({
          type: error('REQUEST'),
          meta: { requestAction: { type: 'REQUEST' } },
        }),
      ).toBe(true);
    });

    it('should return false for success action', () => {
      expect(
        isErrorAction({
          type: success('REQUEST'),
          meta: { requestAction: { type: 'REQUEST' } },
        }),
      ).toBe(false);
    });
  });

  describe('isAbortAction', () => {
    it('should return true for abort action', () => {
      expect(
        isAbortAction({
          type: abort('REQUEST'),
          meta: { requestAction: { type: 'REQUEST' } },
        }),
      ).toBe(true);
    });

    it('should return false for error action', () => {
      expect(
        isAbortAction({
          type: error('REQUEST'),
          meta: { requestAction: { type: 'REQUEST' } },
        }),
      ).toBe(false);
    });
  });

  describe('isRequestActionQuery', () => {
    it('treats request with GET method as queries', () => {
      expect(isRequestActionQuery({ request: { url: '/books' } })).toBe(true);
      expect(
        isRequestActionQuery({ request: { url: '/books', method: 'GET' } }),
      ).toBe(true);
    });

    it('treats request with POST method as mutations', () => {
      expect(
        isRequestActionQuery({ request: { url: '/books', method: 'POST' } }),
      ).toBe(false);
    });

    it('treats request with GET method as mutation when asMutation is true', () => {
      expect(isRequestActionQuery({ request: { url: '/books' } })).toBe(true);
      expect(
        isRequestActionQuery({
          request: { url: '/books', method: 'GET' },
          meta: { asMutation: true },
        }),
      ).toBe(false);
    });

    it('treats request with POST method as query when asMutation is false', () => {
      expect(isRequestActionQuery({ request: { url: '/books' } })).toBe(true);
      expect(
        isRequestActionQuery({
          request: { url: '/books', method: 'POST' },
          meta: { asMutation: false },
        }),
      ).toBe(true);
    });
  });
});
