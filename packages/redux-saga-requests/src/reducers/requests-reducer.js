import { success, error, abort } from '../actions';
import updateData from './update-data';

const initialState = {
  data: null,
  pending: 0,
  error: null,
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
    const data = updateData(state.data, action, mutationConfig);
    return data === state.data ? state : { ...state, data };
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
