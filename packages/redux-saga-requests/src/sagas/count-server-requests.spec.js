import { END } from 'redux-saga';
import { expectSaga } from 'redux-saga-test-plan';

import { createSuccessAction, createErrorAction } from '../actions';
import countServerRequests from './count-server-requests';

describe('sagas', () => {
  describe('countServerRequests', () => {
    it('dispatches END after successful response', () => {
      const request = {
        type: 'FETCH',
        request: { url: '/url' },
      };
      const response = createSuccessAction(request);

      return expectSaga(countServerRequests, {
        serverRequestActions: {},
      })
        .put(END)
        .dispatch(request)
        .dispatch(response)
        .run();
    });

    it('doesnt dispatch END after request without response', () => {
      const request = {
        type: 'FETCH',
        request: { url: '/url' },
      };

      return expectSaga(countServerRequests, {
        serverRequestActions: {},
      })
        .not.put(END)
        .dispatch(request)
        .silentRun(100);
    });

    it('doesnt dispatch END after successful response of request with dependentRequestsNumber', () => {
      const request = {
        type: 'FETCH',
        request: { url: '/url' },
        meta: {
          dependentRequestsNumber: 1,
        },
      };
      const response = createSuccessAction(request);

      return expectSaga(countServerRequests, {
        serverRequestActions: {},
      })
        .not.put(END)
        .dispatch(request)
        .dispatch(response)
        .silentRun(100);
    });

    it('dispatches END after error response', () => {
      const request = {
        type: 'FETCH',
        request: { url: '/url' },
      };
      const response = createErrorAction(request);

      return expectSaga(countServerRequests, {
        serverRequestActions: {},
      })
        .put(END)
        .dispatch(request)
        .dispatch(request)
        .dispatch(response)
        .run();
    });

    it('doesnt dispatch END after error response when finishOnFirstError is false', () => {
      const request = {
        type: 'FETCH',
        request: { url: '/url' },
      };
      const response = createErrorAction(request);

      return expectSaga(countServerRequests, {
        serverRequestActions: {},
        finishOnFirstError: false,
      })
        .not.put(END)
        .dispatch(request)
        .dispatch(request)
        .dispatch(response)
        .silentRun(100);
    });

    it('dispatches END after dependent actions are finished', () => {
      const request = {
        type: 'FETCH',
        request: { url: '/url' },
        meta: {
          dependentRequestsNumber: 1,
        },
      };
      const response = createSuccessAction(request);
      const dependentRequest = {
        type: 'FETCH_DEPENDENT',
        request: { url: '/url' },
        meta: {
          isDependentRequest: true,
        },
      };
      const dependentResponse = createSuccessAction(dependentRequest);

      return expectSaga(countServerRequests, {
        serverRequestActions: {},
      })
        .put(END)
        .dispatch(request)
        .dispatch(response)
        .dispatch(dependentRequest)
        .dispatch(dependentResponse)
        .run();
    });

    it('doesnt dispatch END if not all dependent actions are finished', () => {
      const request = {
        type: 'FETCH',
        request: { url: '/url' },
        meta: {
          dependentRequestsNumber: 2,
        },
      };
      const response = createSuccessAction(request);
      const dependentRequest = {
        type: 'FETCH_DEPENDENT',
        request: { url: '/url' },
        meta: {
          isDependentRequest: true,
        },
      };
      const dependentResponse = createSuccessAction(dependentRequest);

      return expectSaga(countServerRequests, {
        serverRequestActions: {},
      })
        .not.put(END)
        .dispatch(request)
        .dispatch(response)
        .dispatch(dependentRequest)
        .dispatch(dependentRequest)
        .dispatch(dependentResponse)
        .run();
    });
  });
});
