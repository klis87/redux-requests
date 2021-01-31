import { mapObject } from '../helpers';
import {
  websocketOpened,
  websocketClosed,
  openWebsocket,
  closeWebsocket,
} from '../actions';
import {
  GET_WEBSOCKET,
  STOP_SUBSCRIPTIONS,
  OPEN_WEBSOCKET,
  CLOSE_WEBSOCKET,
  WEBSOCKET_OPENED,
} from '../constants';

// normalize from global config default

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
    lazy = false,
    isHeartbeatMessage,
    heartbeatTimeout = 20,
    reconnectTimeout = 5,
  } = {},
}) => {
  let subscriptions = {};
  let ws;
  let active = false;
  let lastHeartbeatTimeout = null;
  let lastReconnectTimeout = null;
  let lastOpenWebsocketAction = null;

  const clearLastReconnectTimeout = () => {
    if (lastReconnectTimeout) {
      clearTimeout(lastReconnectTimeout);
      lastReconnectTimeout = null;
    }
  };

  const clearLastHeartbeatTimeout = () => {
    if (lastHeartbeatTimeout) {
      clearTimeout(lastHeartbeatTimeout);
      lastHeartbeatTimeout = null;
    }
  };

  return store => next => action => {
    if (action.type === OPEN_WEBSOCKET) {
      lastOpenWebsocketAction = action;
    }

    if ((!ws && WS && url && !lazy) || action.type === OPEN_WEBSOCKET) {
      clearLastReconnectTimeout();
      clearLastHeartbeatTimeout();

      if (ws) {
        console.log('closing ws in open');
        ws.close(1000);
      }

      ws = new WS(url, protocols);

      ws.addEventListener('open', () => {
        console.log('opening ws');

        if (!activateOn) {
          store.dispatch(websocketOpened());
          active = true;
        }

        if (onOpen) {
          onOpen(
            store,
            ws,
            action.type === OPEN_WEBSOCKET ? action.props : null,
          );
        }

        if (isHeartbeatMessage) {
          clearLastHeartbeatTimeout();

          lastHeartbeatTimeout = setTimeout(() => {
            store.dispatch(closeWebsocket());
            store.dispatch(lastOpenWebsocketAction ? action : openWebsocket());
          }, heartbeatTimeout * 1000);
        }
      });

      ws.addEventListener('error', e => {
        console.log('error ws');
        if (onError) {
          onError(e, store, ws);
        }
      });

      ws.addEventListener('close', e => {
        console.log('close ws', e, e.code);
        store.dispatch(websocketClosed());
        active = false;

        if (onClose) {
          onClose(e, store, ws);
        }

        clearLastReconnectTimeout();
        clearLastHeartbeatTimeout();

        if (e.code !== 1000 && reconnectTimeout) {
          lastReconnectTimeout = setTimeout(() => {
            store.dispatch(lastOpenWebsocketAction ? action : openWebsocket());
          }, reconnectTimeout * 1000);
        }
      });

      ws.addEventListener('message', message => {
        console.log('message ws', message);

        if (!active && activateOn && activateOn(message)) {
          store.dispatch(websocketOpened());
          active = true;
        }

        if (isHeartbeatMessage && isHeartbeatMessage(message)) {
          clearLastHeartbeatTimeout();

          lastHeartbeatTimeout = setTimeout(() => {
            store.dispatch(closeWebsocket());
            store.dispatch(lastOpenWebsocketAction ? action : openWebsocket());
          }, heartbeatTimeout * 1000);
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

    if (ws && action.type === CLOSE_WEBSOCKET) {
      console.log('closing ws due to CLOSE_WEBSOCKET', action);

      clearLastReconnectTimeout();
      clearLastHeartbeatTimeout();
      ws.close(1000);
      console.log('after calling close');
      ws = null;
    } else if (action.type === WEBSOCKET_OPENED) {
      Object.values(subscriptions).forEach(subscriptionAction => {
        if (subscriptionAction.subscription) {
          ws.send(
            JSON.stringify(
              onSend
                ? onSend(subscriptionAction.subscription, subscriptionAction)
                : subscriptionAction.subscription,
            ),
          );
        }
      });
    } else if (action.type === STOP_SUBSCRIPTIONS) {
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

      if (action.subscription && ws) {
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
