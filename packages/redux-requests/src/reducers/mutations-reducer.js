import {
  getDataFromResponseAction,
  getRequestActionFromResponse,
  isAbortAction,
  isErrorAction,
  isResponseAction,
  isSuccessAction,
} from '../actions';

export default (state, action) => {
  if (!isResponseAction(action)) {
    const mutationType =
      action.type + (action.meta?.requestKey ? action.meta.requestKey : '');

    return {
      ...state,
      [mutationType]: {
        data: null,
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

  if (isSuccessAction(action)) {
    return {
      ...state,
      [mutationType]: {
        data: getDataFromResponseAction(action),
        error: null,
        pending: state[mutationType].pending - 1,
        ref: state[mutationType].ref,
      }
    }
  }

  if (isErrorAction(action)) {
    return {
      ...state,
      [mutationType]: {
        data: null,
        error: action.payload ? action.payload : action.error,
        pending: state[mutationType].pending - 1,
        ref: state[mutationType].ref,
      },
    };
  }

  if (
    isAbortAction(action) &&
    state[mutationType].pending === 1 &&
    state[mutationType].error === null
  ) {
    return state;
  }

  return {
    ...state,
    [mutationType]: {
      data: null,
      error: null,
      pending: state[mutationType].pending - 1,
      ref: state[mutationType].ref,
    },
  };
};
