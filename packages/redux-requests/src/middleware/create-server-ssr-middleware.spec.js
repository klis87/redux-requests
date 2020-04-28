import configureStore from 'redux-mock-store';

import { createSuccessAction, createErrorAction } from '../actions';
import { createServerSsrMiddleware } from '.';

const defer = () => {
  let res;
  let rej;
  const promise = new Promise((resolve, reject) => {
    res = resolve;
    rej = reject;
  });
  promise.resolve = res;
  promise.reject = rej;
  return promise;
};

describe('middleware', () => {
  describe('createServerSsrMiddleware', () => {
    const requestAction = { type: 'REQUEST', request: { url: '/' } };
    const successAction = createSuccessAction(requestAction, 'data');
    const errorAction = createErrorAction(requestAction, 'error');

    it('dispatches END and rejects promise on error response', async () => {
      const requestsPromise = defer();
      const mockStore = configureStore([
        createServerSsrMiddleware(requestsPromise),
      ]);
      const store = mockStore({});
      const result = store.dispatch(errorAction);
      expect(result).toBe(errorAction);
      expect(store.getActions()).toEqual([errorAction]);
      await expect(requestsPromise).rejects.toBe(errorAction);
    });

    it('dispatches END and resolves promise on finished successful requests', async () => {
      const requestsPromise = defer();
      const mockStore = configureStore([
        createServerSsrMiddleware(requestsPromise),
      ]);
      const store = mockStore({});
      store.dispatch(requestAction);
      store.dispatch(requestAction);
      store.dispatch(successAction);
      store.dispatch(successAction);
      expect(store.getActions()).toEqual([
        requestAction,
        requestAction,
        successAction,
        successAction,
      ]);
      await expect(requestsPromise).resolves.toEqual([
        successAction,
        successAction,
      ]);
    });

    it('supports dependent actions', async () => {
      const requestsPromise = defer();
      const mockStore = configureStore([
        createServerSsrMiddleware(requestsPromise),
      ]);
      const store = mockStore({});
      const firstRequestAction = {
        type: 'REQUEST',
        request: { url: '/' },
        meta: { dependentRequestsNumber: 2 },
      };
      const secondRequestAction = {
        type: 'REQUEST2',
        request: { url: '/' },
        meta: { isDependentRequest: true },
      };
      const thirdRequestAction = {
        type: 'REQUEST3',
        request: { url: '/' },
        meta: { isDependentRequest: true },
      };
      const firsResponseAction = createSuccessAction(firstRequestAction);
      const secondResponseAction = createSuccessAction(secondRequestAction);
      const thirdResponseAction = createSuccessAction(thirdRequestAction);
      store.dispatch(firstRequestAction);
      store.dispatch(firsResponseAction);
      store.dispatch(secondRequestAction);
      store.dispatch(thirdRequestAction);
      store.dispatch(secondResponseAction);
      store.dispatch(thirdResponseAction);
      expect(store.getActions()).toEqual([
        firstRequestAction,
        firsResponseAction,
        secondRequestAction,
        thirdRequestAction,
        secondResponseAction,
        thirdResponseAction,
      ]);
      await expect(requestsPromise).resolves.toEqual([
        firsResponseAction,
        secondResponseAction,
        thirdResponseAction,
      ]);
    });
  });
});
