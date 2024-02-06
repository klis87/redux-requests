import {
  isErrorAction,
  isAbortAction,
  isResponseAction,
  getRequestActionFromResponse,
  isRequestAction,
  isRequestActionMutation,
} from '../actions';

export default (state, action) => {
  if (isRequestAction(action) && isRequestActionMutation(action)) {
    const mutationType = action.type + (action.meta.requestKey || '');

    return {
      ...state,
      [mutationType]: {
        error: null,
        pending: (state[mutationType] ? state[mutationType].pending : 0) + 1,
        ref: state[mutationType] ? state[mutationType].ref : {},
      },
    };
  }

  if (
    isResponseAction(action) &&
    isRequestActionMutation(getRequestActionFromResponse(action))
  ) {
    const requestAction = getRequestActionFromResponse(action);
    const mutationType = requestAction.type + (action.meta.requestKey || '');

    if (isErrorAction(action)) {
      return {
        ...state,
        [mutationType]: {
          error: action.error,
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
        error: null,
        pending: state[mutationType].pending - 1,
        ref: state[mutationType].ref,
      },
    };
  }

  return state;
};
