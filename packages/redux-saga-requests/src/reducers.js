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

const getEmptyData = multiple => (multiple ? [] : null);

const operationConfigHasRequestKey = config =>
  typeof config !== 'boolean' && !!config.getRequestKey;

const getInitialRequestState = ({ multiple, operations }) => ({
  data: getEmptyData(multiple),
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

const defaultConfig = {
  multiple: false,
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
    data: getEmptyData(config.multiple),
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

export const createRequestsReducer = (globalConfig = {}) => (
  localConfig,
  reducer = null,
) => (state, action) => {
  const config = { ...defaultConfig, ...globalConfig, ...localConfig };
  const nextState =
    state === undefined ? getInitialState(state, reducer, config) : state;
  const {
    onRequest,
    onSuccess,
    onError,
    onAbort,
    resetOn,
    getData,
    updateData,
    getError,
    operations,
    actionType,
  } = config;
  const normalizedActionType = normalizeActionType(actionType);

  if (
    (typeof resetOn === 'function' && resetOn(action)) ||
    (typeof resetOn !== 'function' &&
      resetOn.map(normalizeActionType).includes(action.type))
  ) {
    return {
      ...getInitialState(state, reducer, config),
      pending: state.pending,
    };
  }

  if (operations && action.type in operations) {
    const operationConfig = operations[action.type];

    return {
      ...state,
      operations: {
        ...state.operations,
        [action.type]: operationConfigHasRequestKey(operationConfig)
          ? {
              ...state.operations[action.type],
              [operationConfig.getRequestKey(action)]: {
                error: null,
                pending: state.operations[action.type][
                  operationConfig.getRequestKey(action)
                ]
                  ? state.operations[action.type][
                      operationConfig.getRequestKey(action)
                    ].pending + 1
                  : 1,
              },
            }
          : {
              error: null,
              pending: state.operations[action.type].pending + 1,
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
    } = state.operations;

    if (isSuccessAction(action)) {
      let dataUpdater = null;

      if (
        (typeof operationConfig === 'boolean' && operationConfig) ||
        (typeof operationConfig !== 'boolean' &&
          typeof operationConfig.updateData === 'boolean' &&
          operationConfig.updateData)
      ) {
        dataUpdater = updateData || getData;
      } else if (typeof operationConfig === 'function') {
        dataUpdater = operationConfig;
      } else if (
        typeof operationConfig !== 'boolean' &&
        typeof operationConfig.updateData !== 'boolean'
      ) {
        dataUpdater = operationConfig.updateData;
      }

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
        operations: {
          ...otherOperations,
          [requestAction.type]: operationConfigHasRequestKey(operationConfig)
            ? {
                ...currentOperation,
                [operationConfig.getRequestKey(requestAction)]: {
                  error: getError(state, action, config),
                  pending:
                    currentOperation[
                      operationConfig.getRequestKey(requestAction)
                    ].pending - 1,
                },
              }
            : {
                error: getError(state, action, config),
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
      operations: {
        ...otherOperations,
        [requestAction.type]: getUpdatedCurrentOperation(),
      },
    };
  }

  switch (action.type) {
    case normalizedActionType:
      return onRequest(state, action, config);
    case success(normalizedActionType):
      return onSuccess(state, action, config);
    case error(normalizedActionType):
      return onError(state, action, config);
    case abort(normalizedActionType):
      return onAbort(state, action, config);
    default:
      return reducer ? reducer(nextState, action) : nextState;
  }
};

export const requestsReducer = createRequestsReducer();
