import { ADD_WATCHER, REMOVE_WATCHER } from '../constants';

export default (state, action, config) => {
  if (config.ssr === 'server') {
    return state;
  }

  if (action.type === ADD_WATCHER) {
    return {
      ...state,
      [action.requestType]:
        state[action.requestType] === undefined
          ? 1
          : state[action.requestType] + 1,
    };
  }

  if (action.type === REMOVE_WATCHER && state[action.requestType] === 1) {
    // eslint-disable-next-line no-unused-vars
    const { [action.requestType]: toRemove, ...remaining } = state;

    return remaining;
  }

  if (action.type === REMOVE_WATCHER && state[action.requestType] !== 1) {
    return {
      ...state,
      [action.requestType]: state[action.requestType] - 1,
    };
  }

  return state;
};
