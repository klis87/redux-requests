import {
  success,
  error,
  abort,
  isRequestAction,
  isResponseAction,
  getRequestActionFromResponse,
} from '../actions';
import updateData from './update-data';

const initialQuery = {
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

const queryReducer = (state = initialQuery, action, actionType) => {
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

const maybeGetQueryActionType = (action, config) => {
  if (isRequestAction(action) && config.isRequestActionQuery(action)) {
    return action.type;
  }

  if (
    isResponseAction(action) &&
    config.isRequestActionQuery(getRequestActionFromResponse(action))
  ) {
    return getRequestActionFromResponse(action).type;
  }

  return null;
};

export default (state, action, config) => {
  if (action.meta && action.meta.mutations) {
    return {
      queries: {
        ...state.queries,
        ...Object.keys(action.meta.mutations)
          .filter(actionType => !!state.queries[actionType])
          .reduce((prev, actionType) => {
            prev[actionType] = queryReducer(
              state.queries[actionType],
              action,
              actionType,
            );
            return prev;
          }, {}),
      },
      normalizedData: state.normalizedData,
    };
  }

  const queryActionType = maybeGetQueryActionType(action, config);

  if (queryActionType) {
    return {
      queries: {
        ...state.queries,
        [queryActionType]: queryReducer(
          state.queries[queryActionType],
          action,
          queryActionType,
        ),
      },
      normalizedData: state.normalizedData,
    };
  }

  return state;
};
