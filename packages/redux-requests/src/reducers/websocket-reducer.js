import { WEBSOCKET_OPENED, WEBSOCKET_CLOSED } from '../constants';

export default (state, action, config) => {
  if (config.ssr === 'server') {
    return state;
  }

  if (action.type === WEBSOCKET_OPENED) {
    return {
      pristine: false,
      connected: true,
    };
  }

  if (action.type === WEBSOCKET_CLOSED) {
    return {
      pristine: false,
      connected: false,
    };
  }

  return state;
};
