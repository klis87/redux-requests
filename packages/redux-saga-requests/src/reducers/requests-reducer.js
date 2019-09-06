import {
  success,
  error,
  abort,
  isSuccessAction,
  isResponseAction,
} from '../actions';

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
  data: (action.meta && action.meta.getData
    ? action.meta.getData
    : config.getData)(state.data, action),
  pending: state.pending - 1,
  error: null,
});

const onError = (state, action, config) => ({
  ...state,
  data: null,
  pending: state.pending - 1,
  error: (action.meta && action.meta.getError
    ? action.meta.getError
    : config.getError)(state.error, action),
});

const onAbort = state => ({
  ...state,
  pending: state.pending - 1,
});

export default (state = initialState, action, actionType, config) => {
  if (
    action.meta &&
    action.meta.mutations &&
    action.meta.mutations[actionType]
  ) {
    const mutationConfig = action.meta.mutations[actionType];

    return isResponseAction(action)
      ? responseMutationReducer(state, action, mutationConfig)
      : requestMutationReducer(state, action, mutationConfig);
  }

  switch (action.type) {
    case actionType:
      return onRequest(state);
    case success(actionType):
      return onSuccess(state, action, config);
    case error(actionType):
      return onError(state, action, config);
    case abort(actionType):
      return onAbort(state, action, config);
    default:
      return state;
  }
};
