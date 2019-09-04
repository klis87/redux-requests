import {
  success,
  error,
  abort,
  isSuccessAction,
  isResponseAction,
  getRequestActionFromResponse,
} from '../actions';
import defaultConfig from './default-config';

// to support libraries like redux-act and redux-actions
const normalizeActionType = actionType =>
  typeof actionType === 'function' ? actionType.toString() : actionType;

const initialState = {
  data: null,
  pending: 0,
  error: null,
};

const getDataUpdater = (reducerConfig, mutationConfig) => {
  if (mutationConfig === true || mutationConfig.updateData === true) {
    return reducerConfig.updateData || reducerConfig.getData;
  } else if (typeof mutationConfig === 'function') {
    return mutationConfig;
  } else if (
    typeof mutationConfig !== 'boolean' &&
    typeof mutationConfig.updateData === 'function'
  ) {
    return mutationConfig.updateData;
  }

  return null;
};

const requestMutationReducer = (state, action, config) => {
  const mutationConfig = config.mutations[action.type];

  if (mutationConfig.updateDataOptimistic) {
    return {
      ...state,
      data: mutationConfig.updateDataOptimistic(state, action, config),
    };
  }

  if (mutationConfig.local) {
    const dataUpdater = getDataUpdater(config, mutationConfig);

    return {
      ...state,
      data: dataUpdater(state, action, config),
    };
  }

  return state;
};

const responseMutationReducer = (state, action, config) => {
  const requestAction = getRequestActionFromResponse(action);
  const mutationConfig = config.mutations[requestAction.type];

  if (isSuccessAction(action)) {
    const dataUpdater = getDataUpdater(config, mutationConfig);

    return dataUpdater
      ? {
          ...state,
          data: dataUpdater(state, action, config),
        }
      : state;
  }

  // error or abort case
  return mutationConfig.revertData
    ? {
        ...state,
        data: mutationConfig.revertData(state, action, config),
      }
    : state;
};

const onRequest = state => ({
  ...state,
  pending: state.pending + 1,
  error: null,
});

const onSuccess = (state, action, config) => ({
  ...state,
  data: config.getData(state, action),
  pending: state.pending - 1,
  error: null,
});

const onError = (state, action, config) => ({
  ...state,
  data: null,
  pending: state.pending - 1,
  error: config.getError(state, action),
});

const onAbort = state => ({
  ...state,
  pending: state.pending - 1,
});

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
      action.meta.mutations &&
      normalizedActionType in action.meta.mutations &&
      (!config.mutations || !(normalizedActionType in config.mutations))
    ) {
      config.mutations = {
        ...config.mutations,
        [action.type]: action.meta.mutations[normalizedActionType],
      };
    }

    let nextState = state || initialState;

    if (shouldActionBeReset(action)) {
      nextState = {
        ...initialState,
        pending: nextState.pending,
      };
    }

    const requestAction = isResponseAction(action)
      ? getRequestActionFromResponse(action)
      : action;

    if (config.mutations && requestAction.type in config.mutations) {
      return isResponseAction(action)
        ? responseMutationReducer(nextState, action, config)
        : requestMutationReducer(nextState, action, config);
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
