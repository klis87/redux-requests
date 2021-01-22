import { mapObject } from '../helpers';
import { websocketOpened, websocketClosed } from '../actions';
import { GET_WEBSOCKET } from '../constants';

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

export default ({ WS, url }) => {
  let subscriptions = {};
  let ws;

  return store => next => action => {
    if (!ws) {
      ws = new WS(url);

      ws.addEventListener('open', () => {
        store.dispatch(websocketOpened());
      });

      ws.addEventListener('error', () => {
        store.dispatch(websocketClosed());
      });

      ws.addEventListener('close', () => {
        store.dispatch(websocketClosed());
      });

      ws.addEventListener('message', message => {
        let data = JSON.parse(message.data);
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

    if (action.subscription !== undefined) {
      if (
        action.meta?.onMessage ||
        action.meta?.mutations ||
        action.meta?.normalize
      ) {
        subscriptions = { ...subscriptions, [action.type]: action };
      }

      if (action.subscription) {
        ws.send(JSON.stringify(action.subscription));
      }
    }

    return next(action);
  };
};
