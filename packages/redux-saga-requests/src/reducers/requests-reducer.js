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
          data: dataUpdater(
            state.data,
            action.payload ? action.payload.data : action.response.data,
          ),
        }
      : state;
  }

  // error or abort case
  return mutationConfig.revertData
    ? {
        ...state,
        data: mutationConfig.revertData(state.data),
      }
    : state;
};

const onRequest = state => ({
  ...state,
  pending: state.pending + 1,
  error: null,
});

const onSuccess = (state, action) => ({
  data: action.payload ? action.payload.data : action.response.data,
  pending: state.pending - 1,
  error: null,
});

const onError = (state, action) => ({
  data: null,
  pending: state.pending - 1,
  error: action.payload ? action.payload : action.error,
});

const onAbort = state => ({
  ...state,
  pending: state.pending - 1,
});

export default (state = initialState, action, actionType) => {
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
      return onSuccess(state, action);
    case error(actionType):
      return onError(state, action);
    case abort(actionType):
      return onAbort(state);
    default:
      return state;
  }
};
