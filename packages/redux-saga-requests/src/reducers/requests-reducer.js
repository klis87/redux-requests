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
          .filter(o => !o.local)
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

const requestOperationReducer = (state, action, config) => {
  const operationConfig = config.operations[action.type];

  return {
    ...state,
    data: operationConfig.updateDataOptimistic
      ? operationConfig.updateDataOptimistic(state, action, config)
      : state.data,
  };
};

const responseOperationReducer = (state, action, config) => {
  const requestAction = getRequestActionFromResponse(action);
  const operationConfig = config.operations[requestAction.type];

  if (isSuccessAction(action)) {
    const dataUpdater = getDataUpdaterForSuccess(config, operationConfig);

    return {
      ...state,
      data: dataUpdater ? dataUpdater(state, action, config) : state.data,
    };
  }

  // error or abort case
  return {
    ...state,
    data: operationConfig.revertData
      ? operationConfig.revertData(state, action, config)
      : state.data,
  };
};

export default localConfig => {
  const config = { ...defaultConfig, ...localConfig };
  const normalizedActionType = normalizeActionType(config.actionType);
  const shouldActionBeReset =
    typeof config.resetOn === 'function'
      ? config.resetOn
      : action => config.resetOn.map(normalizeActionType).includes(action.type);

  return (state, action, extraOperationsConfig) => {
    if (extraOperationsConfig) {
      config.operations = { ...config.operations, ...extraOperationsConfig };
    }

    let nextState = state || getInitialState(config);

    if (shouldActionBeReset(action)) {
      nextState = {
        ...getInitialState(config),
        pending: nextState.pending,
      };
    }

    if (config.operations && action.type in config.operations) {
      return {
        ...requestOperationReducer(nextState, action, config),
        operations: operationsReducer(
          nextState.operations,
          action,
          config,
          config.operations[action.type],
        ),
      };
    }

    if (
      config.operations &&
      isResponseAction(action) &&
      getRequestActionFromResponse(action).type in config.operations
    ) {
      return {
        ...responseOperationReducer(nextState, action, config),
        operations: operationsReducer(
          nextState.operations,
          action,
          config,
          config.operations[getRequestActionFromResponse(action).type],
        ),
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
