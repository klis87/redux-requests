import configureStore from 'redux-mock-store';

import { stopPolling, resetRequests } from '../actions';
import { createQuery } from '../requests-creators';

import createPollingMiddleware from './create-polling-middleware';

const sleep = seconds =>
  new Promise(resolve => setTimeout(resolve, seconds * 1000));

const getPolledAction = action => ({
  ...action,
  meta: { ...action.meta, polled: true },
});

describe('middleware', () => {
  describe('createPollingMiddleware', () => {
    it('doesnt do anything for not polling requests', () => {
      const mockStore = configureStore([createPollingMiddleware()]);
      const store = mockStore({});
      const action = createQuery('REQUEST', { url: '/' })();
      expect(store.dispatch(action)).toBe(action);
      expect(store.getActions()).toEqual([action]);
    });

    it('repeats queries when meta poll defined', async () => {
      const mockStore = configureStore([createPollingMiddleware()]);
      const store = mockStore({});
      const action = createQuery('REQUEST', { url: '/' }, { poll: 0.1 })();
      store.dispatch(action);
      await sleep(0.41);
      expect(store.getActions()).toEqual([
        action,
        getPolledAction(action),
        getPolledAction(action),
        getPolledAction(action),
        getPolledAction(action),
      ]);
    });

    it('works with multiple queries types', async () => {
      const mockStore = configureStore([createPollingMiddleware()]);
      const store = mockStore({});
      const action = createQuery('REQUEST', { url: '/' }, { poll: 0.1 })();
      const action2 = createQuery('REQUEST2', { url: '/' }, { poll: 0.2 })();
      store.dispatch(action);
      await sleep(0.01);
      store.dispatch(action2);
      await sleep(0.41);
      expect(store.getActions()).toEqual([
        action,
        action2,
        getPolledAction(action),
        getPolledAction(action),
        getPolledAction(action2),
        getPolledAction(action),
        getPolledAction(action),
        getPolledAction(action2),
      ]);
    });

    it('clears interval when query of the same type is dispatched', async () => {
      const mockStore = configureStore([createPollingMiddleware()]);
      const store = mockStore({});
      const action = createQuery('REQUEST', { url: '/' }, { poll: 0.1 })();
      const action2 = { ...action, meta: { ...action.meta, poll: undefined } };
      store.dispatch(action);
      await sleep(0.11);
      store.dispatch(action2);
      await sleep(0.2);
      expect(store.getActions()).toEqual([
        action,
        getPolledAction(action),
        action2,
      ]);
    });

    it('clears all intervals on reset action', async () => {
      const mockStore = configureStore([createPollingMiddleware()]);
      const store = mockStore({});
      const action = createQuery('REQUEST', { url: '/' }, { poll: 0.1 })();
      store.dispatch(action);
      await sleep(0.01);
      store.dispatch(resetRequests());
      await sleep(0.11);
      expect(store.getActions()).toEqual([action, resetRequests()]);
    });

    it('clears all intervals on stopPolling action', async () => {
      const mockStore = configureStore([createPollingMiddleware()]);
      const store = mockStore({});
      const action = createQuery('REQUEST', { url: '/' }, { poll: 0.1 })();
      store.dispatch(action);
      await sleep(0.01);
      store.dispatch(stopPolling());
      await sleep(0.11);
      expect(store.getActions()).toEqual([action, stopPolling()]);
    });

    it('can clear specific intervals only on reset action', async () => {
      const mockStore = configureStore([createPollingMiddleware()]);
      const store = mockStore({});
      const action = createQuery('REQUEST', { url: '/' }, { poll: 0.1 })();
      const action2 = createQuery(
        'REQUEST2',
        { url: '/' },
        { poll: 0.1, requestKey: '1' },
      )();

      store.dispatch(action);
      store.dispatch(action2);
      await sleep(0.01);
      store.dispatch(
        resetRequests([{ requestType: 'REQUEST2', requestKey: '1' }]),
      );
      await sleep(0.11);
      expect(store.getActions()).toEqual([
        action,
        action2,
        resetRequests([{ requestType: 'REQUEST2', requestKey: '1' }]),
        getPolledAction(action),
      ]);
    });

    it('can clear specific intervals only on stopPolling action', async () => {
      const mockStore = configureStore([createPollingMiddleware()]);
      const store = mockStore({});
      const action = createQuery('REQUEST', { url: '/' }, { poll: 0.1 })();
      const action2 = createQuery(
        'REQUEST2',
        { url: '/' },
        { poll: 0.1, requestKey: '1' },
      )();
      store.dispatch(action);
      store.dispatch(action2);
      await sleep(0.01);
      store.dispatch(resetRequests(['REQUEST']));
      await sleep(0.11);
      expect(store.getActions()).toEqual([
        action,
        action2,
        resetRequests(['REQUEST']),
        getPolledAction(action2),
      ]);
    });

    it('can clear specific intervals only on stopPolling action', async () => {
      const mockStore = configureStore([createPollingMiddleware()]);
      const store = mockStore({});
      const action = createQuery('REQUEST', { url: '/' }, { poll: 0.1 })();
      const action2 = createQuery(
        'REQUEST2',
        { url: '/' },
        { poll: 0.1, requestKey: '1' },
      )();
      store.dispatch(action);
      store.dispatch(action2);
      await sleep(0.01);
      store.dispatch(resetRequests([{ requestType: 'REQUEST' }]));
      await sleep(0.11);
      expect(store.getActions()).toEqual([
        action,
        action2,
        resetRequests([{ requestType: 'REQUEST' }]),
        getPolledAction(action2),
      ]);
    });
  });
});
