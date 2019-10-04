import {
  success,
  error,
  abort,
  isRequestAction,
  isResponseAction,
  getRequestActionFromResponse,
  isRequestActionQuery,
} from '../actions';
import updateData from './update-data';
import { normalize, mergeData } from '../normalizers';

const initialQuery = {
  data: null,
  pending: 0,
  error: null,
  normalized: false,
};

const normalizedInitialQuery = { ...initialQuery, normalized: true };

const getDataFromResponseAction = action =>
  action.payload ? action.payload.data : action.response.data;

const onRequest = state => ({
  ...state,
  pending: state.pending + 1,
  error: null,
});

const onSuccess = (state, action) => ({
  ...state,
  data: getDataFromResponseAction(action),
  pending: state.pending - 1,
  error: null,
});

const onError = (state, action) => ({
  ...state,
  data: null,
  pending: state.pending - 1,
  error: action.payload ? action.payload : action.error,
});

const onAbort = state => ({
  ...state,
  pending: state.pending - 1,
});

const queryReducer = (state, action, actionType) => {
  if (state === undefined) {
    state =
      action.meta && action.meta.normalize
        ? normalizedInitialQuery
        : initialQuery;
  }

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
    case success(actionType):
      return onSuccess(state, action);
    case error(actionType):
      return onError(state, action);
    case abort(actionType):
      return onAbort(state);
    default:
      return onRequest(state);
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
  let { normalizedData } = state;

  if (
    isResponseAction(action) &&
    action.meta.normalize &&
    !isRequestActionQuery(getRequestActionFromResponse(action))
  ) {
    const [, newNormalizedData] = normalize(getDataFromResponseAction(action));
    normalizedData = mergeData(normalizedData, newNormalizedData);
  }

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
      normalizedData,
    };
  }

  const queryActionType = maybeGetQueryActionType(action, config);

  if (queryActionType) {
    const updatedQuery = queryReducer(
      state.queries[queryActionType],
      action,
      queryActionType,
    );

    if (
      updatedQuery.normalized &&
      updatedQuery.data &&
      (!state.queries[queryActionType] ||
        state.queries[queryActionType].data !== updatedQuery.data)
    ) {
      const [data, newNormalizedData] = normalize(updatedQuery.data);

      return {
        queries: {
          ...state.queries,
          [queryActionType]: { ...updatedQuery, data },
        },
        normalizedData: mergeData(normalizedData, newNormalizedData),
      };
    }

    return {
      queries: {
        ...state.queries,
        [queryActionType]: updatedQuery,
      },
      normalizedData,
    };
  }

  if (state.normalizedData === normalizedData) {
    return state;
  }

  return {
    ...state,
    normalizedData,
  };
};
