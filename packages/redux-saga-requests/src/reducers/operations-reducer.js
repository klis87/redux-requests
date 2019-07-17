import {
  isErrorAction,
  isResponseAction,
  getRequestActionFromResponse,
} from '../actions';

const operationConfigHasRequestKey = config =>
  typeof config !== 'boolean' && !!config.getRequestKey;

const updateOperationsForRequest = (state, action, operationConfig) => {
  if (operationConfig.local) {
    return state;
  }

  if (operationConfigHasRequestKey(operationConfig)) {
    const requestKey = operationConfig.getRequestKey(action);

    return {
      ...state,
      [action.type]: {
        ...state[action.type],
        [requestKey]: {
          error: null,
          pending: state[action.type][requestKey]
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
      pending: state[action.type].pending + 1,
    },
  };
};

export default (state, action, config, operationConfig) => {
  if (!config.handleOperationsState) {
    return null;
  }

  if (!isResponseAction(action)) {
    return updateOperationsForRequest(state, action, operationConfig);
  }

  const requestAction = getRequestActionFromResponse(action);
  const { [requestAction.type]: currentOperation, ...otherOperations } = state;

  if (isErrorAction(action)) {
    return {
      ...otherOperations,
      [requestAction.type]: operationConfigHasRequestKey(operationConfig)
        ? {
            ...currentOperation,
            [operationConfig.getRequestKey(requestAction)]: {
              error: config.getError(state, action, config),
              pending:
                currentOperation[operationConfig.getRequestKey(requestAction)]
                  .pending - 1,
            },
          }
        : {
            error: config.getError(state, action, config),
            pending: currentOperation.pending - 1,
          },
    };
  }

  // success or abort case
  const getUpdatedCurrentOperation = () => {
    if (!operationConfigHasRequestKey(operationConfig)) {
      return {
        error: null,
        pending: currentOperation.pending - 1,
      };
    }

    const currentRequestKey = operationConfig.getRequestKey(requestAction);
    const {
      [currentRequestKey]: operationForRequestKey,
      ...remainingOperations
    } = currentOperation;

    if (operationForRequestKey.pending !== 1) {
      return {
        ...remainingOperations,
        [currentRequestKey]: {
          error: null,
          pending: operationForRequestKey.pending - 1,
        },
      };
    }

    return remainingOperations;
  };

  return {
    ...otherOperations,
    [requestAction.type]: getUpdatedCurrentOperation(),
  };
};
