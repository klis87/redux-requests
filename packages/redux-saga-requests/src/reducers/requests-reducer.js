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

const requestMutationReducer = (state, action, mutationConfig) => {
  if (mutationConfig.updateDataOptimistic) {
    return {
      ...state,
      data: mutationConfig.updateDataOptimistic(state.data),
    };
  }

  if (mutationConfig.local) {
    const dataUpdater = getDataUpdater(mutationConfig);

    return {
      ...state,
      data: dataUpdater(state.data),
    };
  }

  return state;
};

const responseMutationReducer = (state, action, mutationConfig) => {
  if (isSuccessAction(action)) {
    const dataUpdater = getDataUpdater(mutationConfig);

    return dataUpdater
      ? {
          ...state,
          data: dataUpdater(state.data, action),
        }
      : state;
  }

  // error or abort case
  return mutationConfig.revertData
    ? {
        ...state,
        data: mutationConfig.revertData(state.data, action),
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
  data: config.getData(state.data, action),
  pending: state.pending - 1,
  error: null,
});

const onError = (state, action, config) => ({
  ...state,
  data: null,
  pending: state.pending - 1,
  error: config.getError(state.error, action),
});

const onAbort = state => ({
  ...state,
  pending: state.pending - 1,
});

export default localConfig => {
  const config = { ...defaultConfig, ...localConfig };
  const normalizedActionType = normalizeActionType(config.actionType);

  return (state, action) => {
    const nextState = state || initialState;

    if (
      action.meta &&
      action.meta.mutations &&
      action.meta.mutations[normalizedActionType]
    ) {
      const mutationConfig = action.meta.mutations[normalizedActionType];

      return isResponseAction(action)
        ? responseMutationReducer(nextState, action, mutationConfig)
        : requestMutationReducer(nextState, action, mutationConfig);
    }

    switch (action.type) {
      case normalizedActionType:
        return onRequest(nextState);
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
