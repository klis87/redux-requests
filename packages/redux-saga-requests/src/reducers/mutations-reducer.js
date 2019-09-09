import {
  isErrorAction,
  isResponseAction,
  getRequestActionFromResponse,
} from '../actions';

const updateMutationsForRequest = (state, action) => {
  if (action.meta && action.meta.requestKey) {
    const { requestKey } = action.meta;

    return {
      ...state,
      [action.type]: {
        ...state[action.type],
        [requestKey]: {
          error: null,
          pending:
            state[action.type] && state[action.type][requestKey]
              ? state[action.type][requestKey].pending + 1
              : 1,
        },
      },
    };
  }

  return {
    ...state,
    [action.type]: {
      error: null,
      pending: (state[action.type] ? state[action.type].pending : 0) + 1,
    },
  };
};

export default (state, action) => {
  if (!isResponseAction(action)) {
    return updateMutationsForRequest(state, action);
  }

  const requestAction = getRequestActionFromResponse(action);
  const { [requestAction.type]: currentMutation, ...otherMutations } = state;

  if (isErrorAction(action)) {
    return {
      ...otherMutations,
      [requestAction.type]:
        action.meta && action.meta.requestKey
          ? {
              ...currentMutation,
              [action.meta.requestKey]: {
                error: action.payload ? action.payload : action.error,
                pending: currentMutation[action.meta.requestKey].pending - 1,
              },
            }
          : {
              error: action.payload ? action.payload : action.error,
              pending: currentMutation.pending - 1,
            },
    };
  }

  // success or abort case
  const getUpdatedCurrentMutation = () => {
    if (!action.meta || !action.meta.requestKey) {
      return {
        error: null,
        pending: currentMutation.pending - 1,
      };
    }

    const {
      [action.meta.requestKey]: mutationForRequestKey,
      ...remainingMutations
    } = currentMutation;

    if (mutationForRequestKey.pending !== 1) {
      return {
        ...remainingMutations,
        [action.meta.requestKey]: {
          error: null,
          pending: mutationForRequestKey.pending - 1,
        },
      };
    }

    return remainingMutations;
  };

  return {
    ...otherMutations,
    [requestAction.type]: getUpdatedCurrentMutation(),
  };
};
