import {
  isErrorAction,
  isResponseAction,
  getRequestActionFromResponse,
} from '../actions';

const mutationConfigHasRequestKey = config =>
  typeof config !== 'boolean' && !!config.getRequestKey;

const updateMutationsForRequest = (state, action, mutationConfig) => {
  if (mutationConfig.local) {
    return state;
  }

  if (mutationConfigHasRequestKey(mutationConfig)) {
    const requestKey = mutationConfig.getRequestKey(action);

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

export default (state, action, config, mutationConfig) => {
  if (!isResponseAction(action)) {
    return updateMutationsForRequest(state, action, mutationConfig);
  }

  const requestAction = getRequestActionFromResponse(action);
  const { [requestAction.type]: currentMutation, ...otherMutations } = state;

  if (isErrorAction(action)) {
    return {
      ...otherMutations,
      [requestAction.type]: mutationConfigHasRequestKey(mutationConfig)
        ? {
            ...currentMutation,
            [mutationConfig.getRequestKey(requestAction)]: {
              error: config.getError(state, action, config),
              pending:
                currentMutation[mutationConfig.getRequestKey(requestAction)]
                  .pending - 1,
            },
          }
        : {
            error: config.getError(state, action, config),
            pending: currentMutation.pending - 1,
          },
    };
  }

  // success or abort case
  const getUpdatedCurrentMutation = () => {
    if (!mutationConfigHasRequestKey(mutationConfig)) {
      return {
        error: null,
        pending: currentMutation.pending - 1,
      };
    }

    const currentRequestKey = mutationConfig.getRequestKey(requestAction);
    const {
      [currentRequestKey]: mutationForRequestKey,
      ...remainingMutations
    } = currentMutation;

    if (mutationForRequestKey.pending !== 1) {
      return {
        ...remainingMutations,
        [currentRequestKey]: {
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
