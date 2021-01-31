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

/*
This wrapper is implemented to always call onClose when ws,close(1000) is called.
Sometimes onClose is not called at all in native implementation on network disconnection, sometimes it is called later.
Above makes things unpredictable.
Also it cleans all attached event handlers.
*/
class CleanableWebsocket {
  constructor(url, protocols, WS) {
    this.ws = new WS(url, protocols);
    this.onError = null;
    this.onOpen = null;
    this.onClose = null;
    this.onMessage = null;
    this.killed = false;
    this.sentMessages = this.ws.sentMessages;
  }

  addEventListener(type, callback) {
    if (type === 'error') {
      this.onError = callback;
    } else if (type === 'close') {
      // we make sure onClose could be called only once
      this.onClose = e => {
        if (!this.killed) {
          this.killed = true;
          callback(e);
          this.removeAllListeners();
        }
      };
    } else if (type === 'open') {
      this.onOpen = callback;
    } else if (type === 'message') {
      this.onMessage = callback;
    }

    this.ws.addEventListener(type, type === 'close' ? this.onClose : callback);
  }

  removeAllListeners() {
    if (this.onError) {
      this.ws.removeEventListener('error', this.onError);
    }

    if (this.onMessage) {
      this.ws.removeEventListener('message', this.onMessage);
    }

    if (this.onOpen) {
      this.ws.removeEventListener('open', this.onOpen);
    }

    if (this.onClose) {
      this.ws.removeEventListener('close', this.onClose);
    }
  }

  close(code) {
    // for ws.close() we call onClose manually, to force this call always immediately
    if (this.onClose) {
      this.onClose({ code });
    }

    this.ws.close(code);
  }

  send(message) {
    this.ws.send(message);
  }

  sendToClient(message) {
    this.ws.sendToClient(message);
  }

  open() {
    this.ws.open();
  }

  error(e) {
    this.ws.error(e);
  }
}

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
        ws.close(1000);
      }

      ws = new CleanableWebsocket(url, protocols, WS);

      ws.addEventListener('open', () => {
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
            store.dispatch(closeWebsocket(3000));
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
        store.dispatch(websocketClosed(e.code));
        active = false;
        clearLastReconnectTimeout();
        clearLastHeartbeatTimeout();

        if (onClose) {
          onClose(e, store, ws);
        }

        if (e.code !== 1000 && reconnectTimeout) {
          lastReconnectTimeout = setTimeout(() => {
            store.dispatch(lastOpenWebsocketAction ? action : openWebsocket());
          }, reconnectTimeout * 1000);
        }
      });

      ws.addEventListener('message', message => {
        if (!active && activateOn && activateOn(message)) {
          store.dispatch(websocketOpened());
          active = true;
        }

        if (isHeartbeatMessage && isHeartbeatMessage(message)) {
          clearLastHeartbeatTimeout();

          lastHeartbeatTimeout = setTimeout(() => {
            store.dispatch(closeWebsocket(3000));
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
      clearLastReconnectTimeout();
      clearLastHeartbeatTimeout();
      const response = next(action);
      ws.close(action.code);
      ws = null;
      return response;
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
