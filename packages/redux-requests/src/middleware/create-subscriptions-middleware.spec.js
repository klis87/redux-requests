import configureStore from 'redux-mock-store';

import { websocketOpened, getWebsocket, websocketClosed } from '../actions';
import { createQuery, createSubscription } from '../requests-creators';

import createSubscriptionsMiddleware from './create-subscriptions-middleware';

class DummyWebsocket {
  constructor() {
    this.onError = null;
    this.onOpen = null;
    this.onClose = null;
    this.onMessage = null;
    this.sentMessages = [];
  }

  addEventListener(type, callback) {
    if (type === 'error') {
      this.onError = callback;
    } else if (type === 'close') {
      this.onClose = callback;
    } else if (type === 'open') {
      this.onOpen = callback;
    } else if (type === 'message') {
      this.onMessage = callback;
    }

    if (type === 'open') {
      this.open();
    }
  }

  removeEventListener() {
    // not to break tests
  }

  open() {
    if (this.onOpen) {
      this.onOpen();
    }
  }

  error() {
    if (this.onError) {
      this.onError();
    }
  }

  close() {
    if (this.onClose) {
      this.onClose();
    }
  }

  send(message) {
    this.sentMessages.push(message);
  }

  sendToClient(message) {
    if (this.onMessage) {
      this.onMessage({ data: JSON.stringify(message) });
    }
  }
}

describe('middleware', () => {
  describe('createSubscriptionsMiddleware', () => {
    it('doesnt do anything for not subscription requests', () => {
      const mockStore = configureStore([
        createSubscriptionsMiddleware({
          subscriber: {
            WS: DummyWebsocket,
            url: 'ws://localhost:1234',
          },
        }),
      ]);
      const store = mockStore({});
      const action = createQuery('REQUEST', { url: '/' })();
      expect(store.dispatch(action)).toBe(action);
      expect(store.getActions()).toEqual([websocketOpened(), action]);
    });

    it('dispatches websocketOpened on opened', () => {
      const mockStore = configureStore([
        createSubscriptionsMiddleware({
          subscriber: {
            WS: DummyWebsocket,
            url: 'ws://localhost:1234',
          },
        }),
      ]);
      const store = mockStore({});
      store.dispatch(getWebsocket());
      expect(store.getActions()).toEqual([websocketOpened()]);
    });

    it('dispatches websocketOpened and websocketClosed on open and close', () => {
      const mockStore = configureStore([
        createSubscriptionsMiddleware({
          subscriber: {
            WS: DummyWebsocket,
            url: 'ws://localhost:1234',
          },
        }),
      ]);
      const store = mockStore({});
      const ws = store.dispatch(getWebsocket());
      ws.close();
      expect(store.getActions()).toEqual([
        websocketOpened(),
        websocketClosed(),
      ]);
    });

    it('doesnt do anything in meta onMessage if no subscription', () => {
      const mockStore = configureStore([
        createSubscriptionsMiddleware({
          subscriber: {
            WS: DummyWebsocket,
            url: 'ws://localhost:1234',
          },
        }),
      ]);
      const store = mockStore({});
      const ws = store.dispatch(getWebsocket());
      ws.sendToClient({ type: 'SUBSCRIPTION' });
      expect(store.getActions()).toEqual([websocketOpened()]);
    });

    it('doesnt do anything when no matching subscription', () => {
      const mockStore = configureStore([
        createSubscriptionsMiddleware({
          subscriber: {
            WS: DummyWebsocket,
            url: 'ws://localhost:1234',
          },
        }),
      ]);
      const store = mockStore({});
      const ws = store.dispatch(getWebsocket());

      const subscription = createSubscription('SUBSCRIPTION2', null, {
        onMessage: jest.fn(),
      })();

      store.dispatch(subscription);
      ws.sendToClient({ type: 'SUBSCRIPTION' });
      expect(store.getActions()).toEqual([websocketOpened(), subscription]);
      expect(subscription.meta.onMessage).not.toHaveBeenCalled();
      expect(ws.sentMessages).toEqual([]);
    });

    it('calls meta onMessage for active subscription', () => {
      const mockStore = configureStore([
        createSubscriptionsMiddleware({
          subscriber: {
            WS: DummyWebsocket,
            url: 'ws://localhost:1234',
          },
        }),
      ]);
      const store = mockStore({});
      const ws = store.dispatch(getWebsocket());

      const subscription = createSubscription('SUBSCRIPTION', null, {
        onMessage: jest.fn(),
      })();

      store.dispatch(subscription);
      ws.sendToClient({ type: 'SUBSCRIPTION' });

      expect(store.getActions()).toEqual([websocketOpened(), subscription]);
      expect(subscription.meta.onMessage).toHaveBeenCalledTimes(1);
      expect(subscription.meta.onMessage.mock.calls[0][0]).toEqual({
        type: 'SUBSCRIPTION',
      });
      expect(subscription.meta.onMessage.mock.calls[0][1]).toEqual({
        data: JSON.stringify({ type: 'SUBSCRIPTION' }),
      });
      expect(subscription.meta.onMessage.mock.calls[0][2]).toHaveProperty(
        'getState',
      );
    });

    it('transforms data with meta getData', () => {
      const mockStore = configureStore([
        createSubscriptionsMiddleware({
          subscriber: {
            WS: DummyWebsocket,
            url: 'ws://localhost:1234',
          },
        }),
      ]);
      const store = mockStore({});
      const ws = store.dispatch(getWebsocket());

      const subscription = createSubscription('SUBSCRIPTION', null, {
        getData: data => data.type,
        onMessage: jest.fn(),
      })();

      store.dispatch(subscription);
      ws.sendToClient({ type: 'SUBSCRIPTION' });

      expect(store.getActions()).toEqual([websocketOpened(), subscription]);
      expect(subscription.meta.onMessage).toHaveBeenCalledTimes(1);
      expect(subscription.meta.onMessage.mock.calls[0][0]).toEqual(
        'SUBSCRIPTION',
      );
      expect(subscription.meta.onMessage.mock.calls[0][1]).toEqual({
        data: JSON.stringify({ type: 'SUBSCRIPTION' }),
      });
    });

    it('dispatches mutations for received subscription messages', () => {
      const mockStore = configureStore([
        createSubscriptionsMiddleware({
          subscriber: {
            WS: DummyWebsocket,
            url: 'ws://localhost:1234',
          },
        }),
      ]);
      const store = mockStore({});
      const ws = store.dispatch(getWebsocket());

      const onBookAdded = createSubscription('ON_BOOK_ADDED', null, {
        normalize: true,
        mutations: {
          FETCH_BOOK: (data, subscriptionData) =>
            data.concat(subscriptionData.newBook),
        },
      })();

      store.dispatch(onBookAdded);
      ws.sendToClient({ type: 'ON_BOOK_ADDED', newBook: 'New book' });

      const dispatchedActions = store.getActions();

      expect(dispatchedActions.length).toBe(3);
      expect(dispatchedActions[1]).toEqual(onBookAdded);
      expect(dispatchedActions[2].type).toBe('ON_BOOK_ADDED_MUTATION');
      expect(dispatchedActions[2].meta.localData).toEqual({
        type: 'ON_BOOK_ADDED',
        newBook: 'New book',
      });
      expect(dispatchedActions[2].meta.requestType).toBe('LOCAL_MUTATION');
      expect(
        dispatchedActions[2].meta.mutations.FETCH_BOOK(['Old book']),
      ).toEqual(['Old book', 'New book']);
    });

    it('sends message to server if defined in subscription action', () => {
      const mockStore = configureStore([
        createSubscriptionsMiddleware({
          subscriber: {
            WS: DummyWebsocket,
            url: 'ws://localhost:1234',
          },
        }),
      ]);
      const store = mockStore({});
      const ws = store.dispatch(getWebsocket());

      const subscription = createSubscription('SUBSCRIPTION', {
        type: 'SUBSCRIPTION',
      })();

      store.dispatch(subscription);
      ws.sendToClient({ type: 'SUBSCRIPTION' });
      expect(store.getActions()).toEqual([websocketOpened(), subscription]);
      expect(ws.sentMessages).toEqual([
        JSON.stringify({ type: 'SUBSCRIPTION' }),
      ]);
    });
  });
});
