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

const getInitialRequestState = ({ getDefaultData, multiple, operations }) => ({
  data: getDefaultData(multiple),
  pending: 0,
  error: null,
  operations:
    operations &&
    Object.entries(operations).reduce(
      (prev, [k, v]) => ({
        ...prev,
        [k]: operationConfigHasRequestKey(v) ? {} : { error: null, pending: 0 },
      }),
      {},
    ),
});

const getInitialState = (state, reducer, config) => {
  if (!reducer) {
    return getInitialRequestState(config);
  }

  return { ...getInitialRequestState(config), ...reducer(undefined, {}) };
};

const getDataUpdaterForSuccess = (reducerConfig, operationConfig) => {
  if (
    operationConfig === true ||
    (typeof operationConfig !== 'boolean' &&
      operationConfig.updateData === true)
  ) {
    return reducerConfig.updateData || reducerConfig.getData;
  } else if (typeof operationConfig === 'function') {
    return operationConfig;
  } else if (
    typeof operationConfig !== 'boolean' &&
    typeof operationConfig.updateData !== 'boolean'
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

export const requestsReducer = (localConfig, reducer = null) => {
  const config = { ...defaultConfig, ...localConfig };
  const {
    onRequest,
    onSuccess,
    onError,
    onAbort,
    resetOn,
    getError,
    operations,
    actionType,
  } = config;
  const normalizedActionType = normalizeActionType(actionType);

  let shouldResetForAction = resetOn;
  if (typeof resetOn !== 'function') {
    const normalizedResetActions = resetOn.map(normalizeActionType);
    shouldResetForAction = action =>
      normalizedResetActions.includes(action.type);
  }

  return (state, action) => {
    let nextState =
      state === undefined ? getInitialState(state, reducer, config) : state;

    if (shouldResetForAction(action)) {
      nextState = {
        ...getInitialState(nextState, reducer, config),
        pending: nextState.pending,
      };
    }

    if (operations && action.type in operations) {
      const operationConfig = operations[action.type];

      return {
        ...nextState,
        data: operationConfig.updateDataOptimistic
          ? operationConfig.updateDataOptimistic(nextState, action, config)
          : nextState.data,
        operations: {
          ...nextState.operations,
          [action.type]: operationConfigHasRequestKey(operationConfig)
            ? {
                ...nextState.operations[action.type],
                [operationConfig.getRequestKey(action)]: {
                  error: null,
                  pending: nextState.operations[action.type][
                    operationConfig.getRequestKey(action)
                  ]
                    ? nextState.operations[action.type][
                        operationConfig.getRequestKey(action)
                      ].pending + 1
                    : 1,
                },
              }
            : {
                error: null,
                pending: nextState.operations[action.type].pending + 1,
              },
        },
      };
    }

    if (
      operations &&
      isResponseAction(action) &&
      getRequestActionFromResponse(action).type in operations
    ) {
      const requestAction = getRequestActionFromResponse(action);
      const operationConfig = operations[requestAction.type];
      const {
        [requestAction.type]: currentOperation,
        ...otherOperations
      } = nextState.operations;

      if (isSuccessAction(action)) {
        const dataUpdater = getDataUpdaterForSuccess(config, operationConfig);
        const getUpdatedCurrentOperation = () => {
          if (!operationConfigHasRequestKey(operationConfig)) {
            return {
              error: null,
              pending: currentOperation.pending - 1,
            };
          }

          const currentRequestKey = operationConfig.getRequestKey(
            requestAction,
          );
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
          ...nextState,
          data: dataUpdater
            ? dataUpdater(nextState, action, config)
            : nextState.data,
          operations: {
            ...otherOperations,
            [requestAction.type]: getUpdatedCurrentOperation(),
          },
        };
      }

      if (isErrorAction(action)) {
        return {
          ...nextState,
          data: operationConfig.revertData
            ? operationConfig.revertData(nextState, action, config)
            : nextState.data,
          operations: {
            ...otherOperations,
            [requestAction.type]: operationConfigHasRequestKey(operationConfig)
              ? {
                  ...currentOperation,
                  [operationConfig.getRequestKey(requestAction)]: {
                    error: getError(nextState, action, config),
                    pending:
                      currentOperation[
                        operationConfig.getRequestKey(requestAction)
                      ].pending - 1,
                  },
                }
              : {
                  error: getError(nextState, action, config),
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
        ...nextState,
        data: operationConfig.revertData
          ? operationConfig.revertData(nextState, action, config)
          : nextState.data,
        operations: {
          ...otherOperations,
          [requestAction.type]: getUpdatedCurrentOperation(),
        },
      };
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
        return reducer ? reducer(nextState, action) : nextState;
    }
  };
};
