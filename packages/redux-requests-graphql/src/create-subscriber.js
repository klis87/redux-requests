export const createSubscriber = ({
  url,
  WS,
  lazy,
  heartbeatTimeout,
  reconnectTimeout,
  useHeartbeat = false,
}) => ({
  WS,
  url,
  lazy,
  heartbeatTimeout,
  reconnectTimeout,
  protocols: 'graphql-ws',
  isHeartbeatMessage: useHeartbeat
    ? message => {
        const data = JSON.parse(message.data);
        return data.type === 'ka';
      }
    : undefined,
  onOpen: (store, ws, props) => {
    ws.send(
      JSON.stringify({
        type: 'connection_init',
        payload: { token: props },
      }),
    );
  },
  activateOn: message => {
    const data = JSON.parse(message.data);
    return data.type === 'connection_ack';
  },
  onSend: (message, subscriptionAction) => {
    return {
      type: 'start',
      id: subscriptionAction.type + (subscriptionAction.meta?.requestKey || ''),
      payload: message,
    };
  },
  getData: data => {
    if (data.type === 'data' && data.payload.data) {
      return { type: data.id, ...data.payload.data };
    }

    return data;
  },
  onStopSubscriptions: (stoppedSubscriptions, action, ws) => {
    if (!ws) {
      return;
    }

    stoppedSubscriptions.forEach(subscription => {
      ws.send(JSON.stringify({ type: 'stop', id: subscription }));
    });
  },
  onMessage: data => {
    if (
      (data.type === 'data' && data.payload && data.payload.errors) ||
      data.type === 'connection_error'
    ) {
      Promise.reject(data);
    }
  },
});
