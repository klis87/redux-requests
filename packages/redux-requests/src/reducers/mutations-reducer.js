import {
  isErrorAction,
  isResponseAction,
  getRequestActionFromResponse,
} from '../actions';

export default (state, action) => {
  if (!isResponseAction(action)) {
    const mutationType =
      action.type + (action.meta?.requestKey ? action.meta.requestKey : '');

    return {
      ...state,
      [mutationType]: {
        error: null,
        pending: (state[mutationType] ? state[mutationType].pending : 0) + 1,
        ref: state[mutationType] ? state[mutationType].ref : {},
      },
    };
  }

  const requestAction = getRequestActionFromResponse(action);
  const mutationType =
    requestAction.type +
    (action.meta?.requestKey ? action.meta.requestKey : '');

  if (isErrorAction(action)) {
    return {
      ...state,
      [mutationType]: {
        error: action.payload ? action.payload : action.error,
        pending: state[mutationType].pending - 1,
        ref: state[mutationType].ref,
      },
    };
  }

  // success or abort case
  return {
    ...state,
    [mutationType]: {
      error: null,
      pending: state[mutationType].pending - 1,
      ref: state[mutationType].ref,
    },
  };
};
