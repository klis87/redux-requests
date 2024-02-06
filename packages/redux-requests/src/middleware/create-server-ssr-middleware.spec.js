import configureStore from 'redux-mock-store';

import { createSuccessAction, createErrorAction } from '../actions';
import { createQuery } from '../requests-creators';

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
    const requestAction = createQuery('REQUEST', { url: '/' })();
    const successAction = createSuccessAction(requestAction, 'data');
    const errorAction = createErrorAction(requestAction, 'error');

    it('rejects promise on error response', async () => {
      const requestsPromise = defer();
      const mockStore = configureStore([
        createServerSsrMiddleware(requestsPromise),
      ]);
      const store = mockStore({});
      store.dispatch(requestAction);
      store.dispatch(requestAction);
      store.dispatch(successAction);
      store.dispatch(errorAction);
      expect(store.getActions()).toEqual([
        requestAction,
        requestAction,
        successAction,
        errorAction,
      ]);
      await expect(requestsPromise).rejects.toEqual({
        successActions: [successAction],
        errorActions: [errorAction],
      });
    });

    it('resolves promise on finished successful requests', async () => {
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
      const firstRequestAction = createQuery(
        'REQUEST',
        { url: '/' },
        { dependentRequestsNumber: 2 },
      )();
      const secondRequestAction = createQuery(
        'REQUEST2',
        { url: '/' },
        { isDependentRequest: true },
      )();
      const thirdRequestAction = createQuery(
        'REQUEST3',
        { url: '/' },
        { isDependentRequest: true },
      )();
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

    it('supports dependent actions when first one fails', async () => {
      const requestsPromise = defer();
      const mockStore = configureStore([
        createServerSsrMiddleware(requestsPromise),
      ]);
      const store = mockStore({});
      const firstRequestAction = createQuery(
        'REQUEST',
        { url: '/' },
        { dependentRequestsNumber: 2 },
      )();
      // const secondRequestAction = {
      //   type: 'REQUEST2',
      //   request: { url: '/' },
      //   meta: { isDependentRequest: true },
      // };
      // const thirdRequestAction = {
      //   type: 'REQUEST3',
      //   request: { url: '/' },
      //   meta: { isDependentRequest: true },
      // };
      const firsErrorAction = createErrorAction(firstRequestAction);
      // const secondResponseAction = createSuccessAction(secondRequestAction);
      // const thirdResponseAction = createSuccessAction(thirdRequestAction);
      store.dispatch(firstRequestAction);
      store.dispatch(firsErrorAction);
      // store.dispatch(secondRequestAction);
      // store.dispatch(thirdRequestAction);
      // store.dispatch(secondResponseAction);
      // store.dispatch(thirdResponseAction);
      expect(store.getActions()).toEqual([
        firstRequestAction,
        firsErrorAction,
        // secondRequestAction,
        // thirdRequestAction,
        // secondResponseAction,
        // thirdResponseAction,
      ]);
      await expect(requestsPromise).rejects.toEqual({
        successActions: [],
        errorActions: [firsErrorAction],
      });
    });

    it('supports dependent actions when 3rd action failes', async () => {
      const requestsPromise = defer();
      const mockStore = configureStore([
        createServerSsrMiddleware(requestsPromise),
      ]);
      const store = mockStore({});
      const firstRequestAction = createQuery(
        'REQUEST',
        { url: '/' },
        { dependentRequestsNumber: 2 },
      )();
      const secondRequestAction = createQuery(
        'REQUEST2',
        { url: '/' },
        { isDependentRequest: true },
      )();
      const thirdRequestAction = createQuery(
        'REQUEST3',
        { url: '/' },
        { isDependentRequest: true },
      )();
      const firsResponseAction = createSuccessAction(firstRequestAction);
      const secondResponseAction = createSuccessAction(secondRequestAction);
      const thirdErrorAction = createErrorAction(thirdRequestAction);
      store.dispatch(firstRequestAction);
      store.dispatch(firsResponseAction);
      store.dispatch(secondRequestAction);
      store.dispatch(thirdRequestAction);
      store.dispatch(secondResponseAction);
      store.dispatch(thirdErrorAction);
      expect(store.getActions()).toEqual([
        firstRequestAction,
        firsResponseAction,
        secondRequestAction,
        thirdRequestAction,
        secondResponseAction,
        thirdErrorAction,
      ]);
      await expect(requestsPromise).rejects.toEqual({
        successActions: [firsResponseAction, secondResponseAction],
        errorActions: [thirdErrorAction],
      });
    });

    it('supports dependent actions 1 => 2 => 3 when 2nd fails', async () => {
      const requestsPromise = defer();
      const mockStore = configureStore([
        createServerSsrMiddleware(requestsPromise),
      ]);
      const store = mockStore({});
      const firstRequestAction = createQuery(
        'REQUEST',
        { url: '/' },
        { dependentRequestsNumber: 1 },
      )();
      const secondRequestAction = createQuery(
        'REQUEST2',
        { url: '/' },
        { isDependentRequest: true, dependentRequestsNumber: 1 },
      )();
      // const thirdRequestAction = {
      //   type: 'REQUEST3',
      //   request: { url: '/' },
      //   meta: { isDependentRequest: true },
      // };
      const firsResponseAction = createSuccessAction(firstRequestAction);
      const secondErrorAction = createErrorAction(secondRequestAction);
      // const thirdResponseAction = createSuccessAction(thirdRequestAction);
      store.dispatch(firstRequestAction);
      store.dispatch(firsResponseAction);
      store.dispatch(secondRequestAction);
      // store.dispatch(thirdRequestAction);
      store.dispatch(secondErrorAction);
      // store.dispatch(thirdResponseAction);
      expect(store.getActions()).toEqual([
        firstRequestAction,
        firsResponseAction,
        secondRequestAction,
        // thirdRequestAction,
        secondErrorAction,
        // thirdResponseAction,
      ]);
      await expect(requestsPromise).rejects.toEqual({
        successActions: [firsResponseAction],
        errorActions: [secondErrorAction],
      });
    });
  });
});
