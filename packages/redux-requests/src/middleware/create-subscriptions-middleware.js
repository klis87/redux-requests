import { mapObject } from '../helpers';
import { websocketOpened, websocketClosed } from '../actions';
import { GET_WEBSOCKET, STOP_SUBSCRIPTIONS } from '../constants';

// probably do this on subscription save
const transformIntoLocalMutation = (
  subscriptionAction,
  subscriptionData,
  message,
) => {
  const meta = {};

  if (subscriptionAction.meta.normalize) {
    meta.localData = subscriptionData;
  }

  if (subscriptionAction.meta.mutations) {
    meta.mutations = mapObject(subscriptionAction.meta.mutations, (k, v) => ({
      local: true,
      updateData: data => v(data, subscriptionData, message),
    }));
  }

  return {
    type: `${subscriptionAction.type}_MUTATION`,
    meta,
  };
};

const getDefaultWebSocket = () =>
  typeof WebSocket === 'undefined' ? undefined : WebSocket;

export default ({
  subscriber: {
    WS = getDefaultWebSocket(),
    url,
    protocols,
    onOpen,
    onClose,
    onError,
    onMessage,
    onSend,
    activateOn,
    getData,
    onStopSubscriptions,
  } = {},
}) => {
  let subscriptions = {};
  let ws;
  let active = false;

  return store => next => action => {
    if (!ws && WS && url) {
      ws = new WS(url, protocols);

      ws.addEventListener('open', () => {
        if (!activateOn) {
          store.dispatch(websocketOpened());
          active = true;
        }

        if (onOpen) {
          onOpen(store, ws);
        }
      });

      ws.addEventListener('error', e => {
        store.dispatch(websocketClosed());
        active = false;

        if (onError) {
          onError(e, store, ws);
        }
      });

      ws.addEventListener('close', e => {
        store.dispatch(websocketClosed());
        active = false;

        if (onClose) {
          onClose(e, store, ws);
        }
      });

      ws.addEventListener('message', message => {
        if (!active && activateOn && activateOn(message)) {
          store.dispatch(websocketOpened());
          active = true;
        }

        let data = JSON.parse(message.data);

        if (getData) {
          data = getData(data);
        }

        if (onMessage) {
          onMessage(data, message, store);
        }

        const subscription = subscriptions[data.type];

        if (subscription) {
          if (subscription.meta?.getData) {
            data = subscription.meta.getData(data);
          }

          if (subscription.meta?.onMessage) {
            subscription.meta.onMessage(data, message, store);
          }

          if (subscription.meta?.mutations || subscription.meta?.normalize) {
            store.dispatch(
              transformIntoLocalMutation(subscription, data, message),
            );
          }
        }
      });
    }

    if (action.type === GET_WEBSOCKET) {
      return ws;
    }

    if (action.type === STOP_SUBSCRIPTIONS) {
      if (!action.subscriptions) {
        if (onStopSubscriptions) {
          onStopSubscriptions(Object.keys(subscriptions), action, ws, store);
        }

        subscriptions = {};
      } else {
        if (onStopSubscriptions) {
          onStopSubscriptions(action.subscriptions, action, ws, store);
        }

        subscriptions = mapObject(subscriptions, (k, v) =>
          action.subscriptions.includes(k) ? undefined : v,
        );
      }
    } else if (action.subscription !== undefined) {
      if (
        action.meta?.onMessage ||
        action.meta?.mutations ||
        action.meta?.normalize
      ) {
        subscriptions = {
          ...subscriptions,
          [action.type + (action.meta.requestKey || '')]: action,
        };
      }

      if (action.subscription) {
        ws.send(
          JSON.stringify(
            onSend ? onSend(action.subscription, action) : action.subscription,
          ),
        );
      }
    }

    return next(action);
  };
};
