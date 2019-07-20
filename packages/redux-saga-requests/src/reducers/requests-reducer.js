import {
  success,
  error,
  abort,
  isSuccessAction,
  isResponseAction,
  getRequestActionFromResponse,
} from '../actions';
import operationsReducer from './operations-reducer';
import defaultConfig from './default-config';

// to support libraries like redux-act and redux-actions
const normalizeActionType = actionType =>
  typeof actionType === 'function' ? actionType.toString() : actionType;

const operationConfigHasRequestKey = config =>
  typeof config !== 'boolean' && !!config.getRequestKey;

const getInitialState = ({
  getDefaultData,
  multiple,
  operations,
  handleOperationsState,
}) => ({
  data: getDefaultData(multiple),
  pending: 0,
  error: null,
  operations:
    handleOperationsState && operations
      ? Object.entries(operations)
          .filter(([, v]) => !v.local)
          .reduce(
            (prev, [k, v]) => ({
              ...prev,
              [k]: operationConfigHasRequestKey(v)
                ? {}
                : { error: null, pending: 0 },
            }),
            {},
          )
      : null,
});

const getDataUpdater = (reducerConfig, operationConfig) => {
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

const requestOperationReducer = (state, action, config) => {
  const operationConfig = config.operations[action.type];

  if (operationConfig.updateDataOptimistic) {
    return {
      ...state,
      data: operationConfig.updateDataOptimistic(state, action, config),
    };
  }

  if (operationConfig.local) {
    const dataUpdater = getDataUpdater(config, operationConfig);

    return {
      ...state,
      data: dataUpdater(state, action, config),
    };
  }

  return state;
};

const responseOperationReducer = (state, action, config) => {
  const requestAction = getRequestActionFromResponse(action);
  const operationConfig = config.operations[requestAction.type];

  if (isSuccessAction(action)) {
    const dataUpdater = getDataUpdater(config, operationConfig);

    return dataUpdater
      ? {
          ...state,
          data: dataUpdater ? dataUpdater(state, action, config) : state.data,
        }
      : state;
  }

  // error or abort case
  return operationConfig.revertData
    ? {
        ...state,
        data: operationConfig.revertData(state, action, config),
      }
    : state;
};

export default localConfig => {
  const config = { ...defaultConfig, ...localConfig };
  const normalizedActionType = normalizeActionType(config.actionType);
  const shouldActionBeReset =
    typeof config.resetOn === 'function'
      ? config.resetOn
      : action => config.resetOn.map(normalizeActionType).includes(action.type);

  return (state, action) => {
    if (
      action.meta &&
      action.meta.operations &&
      normalizedActionType in action.meta.operations &&
      (!config.operations || !(normalizedActionType in config.operations))
    ) {
      config.operations = {
        ...config.operations,
        [action.type]: action.meta.operations[normalizedActionType],
      };
    }

    let nextState = state || getInitialState(config);

    if (shouldActionBeReset(action)) {
      nextState = {
        ...getInitialState(config),
        pending: nextState.pending,
      };
    }

    const requestAction = isResponseAction(action)
      ? getRequestActionFromResponse(action)
      : action;

    if (config.operations && requestAction.type in config.operations) {
      return {
        ...(isResponseAction(action)
          ? responseOperationReducer(nextState, action, config)
          : requestOperationReducer(nextState, action, config)),
        operations: config.handleOperationsState
          ? operationsReducer(
              nextState.operations,
              action,
              config,
              config.operations[requestAction.type],
            )
          : null,
      };
    }

    switch (action.type) {
      case normalizedActionType:
        return config.onRequest(nextState, action, config);
      case success(normalizedActionType):
        return config.onSuccess(nextState, action, config);
      case error(normalizedActionType):
        return config.onError(nextState, action, config);
      case abort(normalizedActionType):
        return config.onAbort(nextState, action, config);
      default:
        return nextState;
    }
  };
};
