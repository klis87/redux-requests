import {
  getRequestActionFromResponse,
  isRequestAction,
  isResponseAction,
  isSuccessAction,
} from '../actions';

export default (state = [], action, ssr) => {
  if (ssr === 'server' && isResponseAction(action) && isSuccessAction(action)) {
    return [...state, getRequestActionFromResponse(action).type];
  }

  if (
    ssr === 'client' &&
    isRequestAction(action) &&
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
