import defaultConfig from '../default-config';
import { getRequestActionFromResponse, isResponseAction } from '../actions';
import { JOIN_REQUEST } from '../constants';

export default (state = [], action, config = defaultConfig) => {
  if (config.ssr === 'server' && isResponseAction(action)) {
    return [
      ...state,
      getRequestActionFromResponse(action).type +
        (action.meta.requestKey || ''),
    ];
  }

  if (
    config.ssr === 'server' &&
    action.type === JOIN_REQUEST &&
    action.rehydrate
  ) {
    return [...state, { requestType: action.requestType, duplicate: true }];
  }

  if (
    config.ssr === 'client' &&
    config.isRequestAction(action) &&
    (action.meta?.ssrResponse || action.meta?.ssrError)
  ) {
    const indexToRemove = state.findIndex(
      v =>
        (v.requestType || v) === action.type + (action.meta.requestKey || ''),
    );

    if (indexToRemove >= 0) {
      return state.filter((_, i) => i !== indexToRemove);
    }
  }

  return state;
};
