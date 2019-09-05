import {
  success,
  error,
  abort,
  isSuccessAction,
  isResponseAction,
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

const getDataUpdater = mutationConfig => {
  if (typeof mutationConfig === 'function') {
    return mutationConfig;
  } else if (mutationConfig.updateData) {
    return mutationConfig.updateData;
  }

  return null;
};

const requestMutationReducer = (state, action, config, mutationConfig) => {
  if (mutationConfig.updateDataOptimistic) {
    return {
      ...state,
      data: mutationConfig.updateDataOptimistic(state, action, config),
    };
  }

  if (mutationConfig.local) {
    const dataUpdater = getDataUpdater(mutationConfig);

    return {
      ...state,
      data: dataUpdater(state, action, config),
    };
  }

  return state;
};

const responseMutationReducer = (state, action, config, mutationConfig) => {
  if (isSuccessAction(action)) {
    const dataUpdater = getDataUpdater(mutationConfig);

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
    let nextState = state || initialState;

    if (shouldActionBeReset(action)) {
      nextState = {
        ...initialState,
        pending: nextState.pending,
      };
    }

    if (
      action.meta &&
      action.meta.mutations &&
      normalizedActionType in action.meta.mutations
    ) {
      const mutationConfig = action.meta.mutations[normalizedActionType];

      return isResponseAction(action)
        ? responseMutationReducer(nextState, action, config, mutationConfig)
        : requestMutationReducer(nextState, action, config, mutationConfig);
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
