import {
  success,
  error,
  abort,
  isSuccessAction,
  isErrorAction,
  isResponseAction,
  getRequestActionFromResponse,
} from './actions';

// to support libraries like redux-act and redux-actions
const normalizeActionType = actionType =>
  typeof actionType === 'function' ? actionType.toString() : actionType;

const operationConfigHasRequestKey = config =>
  typeof config !== 'boolean' && !!config.getRequestKey;

const getInitialState = ({ getDefaultData, multiple, operations }) => ({
  data: getDefaultData(multiple),
  pending: 0,
  error: null,
  operations:
    operations &&
    Object.entries(operations)
      .filter(o => !o.local)
      .reduce(
        (prev, [k, v]) => ({
          ...prev,
          [k]: operationConfigHasRequestKey(v)
            ? {}
            : { error: null, pending: 0 },
        }),
        {},
      ),
});

const getDataUpdaterForSuccess = (reducerConfig, operationConfig) => {
  if (operationConfig === true || operationConfig.updateData === true) {
    return reducerConfig.updateData || reducerConfig.getData;
  } else if (typeof operationConfig === 'function') {
    return operationConfig;
  } else if (
    typeof operationConfig !== 'boolean' &&
    typeof operationConfig.updateData === 'function'
  ) {
    return operationConfig.updateData;
  }

  return null;
};

const defaultConfig = {
  multiple: false,
  getDefaultData: multiple => (multiple ? [] : null),
  getData: (state, action) =>
    action.payload ? action.payload.data : action.data,
  updateData: null,
  getError: (state, action) => (action.payload ? action.payload : action.error),
  onRequest: state => ({
    ...state,
    pending: state.pending + 1,
    error: null,
  }),
  onSuccess: (state, action, config) => ({
    ...state,
    data: config.getData(state, action, config),
    pending: state.pending - 1,
    error: null,
  }),
  onError: (state, action, config) => ({
    ...state,
    data: config.getDefaultData(config.multiple),
    pending: state.pending - 1,
    error: config.getError(state, action, config),
  }),
  onAbort: state => ({
    ...state,
    pending: state.pending - 1,
  }),
  resetOn: [],
  operations: null,
};

const updateOperationsForRequest = (
  operationsState,
  action,
  operationConfig,
) => {
  if (operationConfig.local) {
    return operationsState;
  }

  if (operationConfigHasRequestKey(operationConfig)) {
    const requestKey = operationConfig.getRequestKey(action);

    return {
      ...operationsState,
      [action.type]: {
        ...operationsState[action.type],
        [requestKey]: {
          error: null,
          pending: operationsState[action.type][requestKey]
            ? operationsState[action.type][requestKey].pending + 1
            : 1,
        },
      },
    };
  }

  return {
    ...operationsState,
    [action.type]: {
      error: null,
      pending: operationsState[action.type].pending + 1,
    },
  };
};

const requestOperationReducer = (state, action, config) => {
  const operationConfig = config.operations[action.type];

  return {
    ...state,
    data: operationConfig.updateDataOptimistic
      ? operationConfig.updateDataOptimistic(state, action, config)
      : state.data,
    operations: updateOperationsForRequest(
      state.operations,
      action,
      operationConfig,
    ),
  };
};

const responseOperationReducer = (state, action, config) => {
  const requestAction = getRequestActionFromResponse(action);
  const operationConfig = config.operations[requestAction.type];
  const {
    [requestAction.type]: currentOperation,
    ...otherOperations
  } = state.operations;

  if (isSuccessAction(action)) {
    const dataUpdater = getDataUpdaterForSuccess(config, operationConfig);
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
      ...state,
      data: dataUpdater ? dataUpdater(state, action, config) : state.data,
      operations: {
        ...otherOperations,
        [requestAction.type]: getUpdatedCurrentOperation(),
      },
    };
  }

  if (isErrorAction(action)) {
    return {
      ...state,
      data: operationConfig.revertData
        ? operationConfig.revertData(state, action, config)
        : state.data,
      operations: {
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
      },
    };
  }

  // abort case
  const getUpdatedCurrentOperation = () => {
    if (!operationConfigHasRequestKey(operationConfig)) {
      return {
        ...currentOperation,
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
          ...operationForRequestKey,
          pending: operationForRequestKey.pending - 1,
        },
      };
    }

    return remainingOperations;
  };

  return {
    ...state,
    data: operationConfig.revertData
      ? operationConfig.revertData(state, action, config)
      : state.data,
    operations: {
      ...otherOperations,
      [requestAction.type]: getUpdatedCurrentOperation(),
    },
  };
};

export const requestsReducer = localConfig => {
  const config = { ...defaultConfig, ...localConfig };
  const {
    onRequest,
    onSuccess,
    onError,
    onAbort,
    resetOn,
    operations,
    actionType,
  } = config;
  const normalizedActionType = normalizeActionType(actionType);
  const shouldActionBeReset =
    typeof resetOn === 'function'
      ? resetOn
      : action => resetOn.map(normalizeActionType).includes(action.type);

  return (state, action) => {
    let nextState = state || getInitialState(config);

    if (shouldActionBeReset(action)) {
      nextState = {
        ...getInitialState(config),
        pending: nextState.pending,
      };
    }

    if (operations && action.type in operations) {
      return requestOperationReducer(nextState, action, config);
    }

    if (
      operations &&
      isResponseAction(action) &&
      getRequestActionFromResponse(action).type in operations
    ) {
      return responseOperationReducer(nextState, action, config);
    }

    switch (action.type) {
      case normalizedActionType:
        return onRequest(nextState, action, config);
      case success(normalizedActionType):
        return onSuccess(nextState, action, config);
      case error(normalizedActionType):
        return onError(nextState, action, config);
      case abort(normalizedActionType):
        return onAbort(nextState, action, config);
      default:
        return nextState;
    }
  };
};
