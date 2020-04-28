import defaultConfig from '../default-config';
import {
  getRequestActionFromResponse,
  isResponseAction,
  isSuccessAction,
} from '../actions';

export default (state = [], action, config = defaultConfig) => {
  if (
    config.ssr === 'server' &&
    isResponseAction(action) &&
    isSuccessAction(action)
  ) {
    return [...state, getRequestActionFromResponse(action).type];
  }

  if (
    config.ssr === 'client' &&
    config.isRequestAction(action) &&
    action.meta &&
    action.meta.ssrResponse
  ) {
    const indexToRemove = state.findIndex(v => v === action.type);

    if (indexToRemove >= 0) {
      return state.filter((_, i) => i !== indexToRemove);
    }
  }

  return state;
};
