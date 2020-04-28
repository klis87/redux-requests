import defaultConfig from '../default-config';
import {
  success,
  error,
  abort,
  isResponseAction,
  getRequestActionFromResponse,
  isErrorAction,
  isSuccessAction,
} from '../actions';
import updateData from './update-data';
import { normalize, mergeData } from '../normalizers';
import { getQuery } from '../selectors';

const getInitialQuery = normalized => ({
  data: null,
  pending: 0,
  error: null,
  ref: {},
  normalized,
  usedKeys: normalized ? {} : null,
});

const getDataFromResponseAction = action =>
  action.payload ? action.payload.data : action.response.data;

const shouldBeNormalized = (action, config) =>
  action.meta && action.meta.normalize !== undefined
    ? action.meta.normalize
    : config.normalize;

const queryReducer = (state, action, actionType, config, normalizedData) => {
  if (state === undefined) {
    state = getInitialQuery(shouldBeNormalized(action, config));
  }

  if (
    action.meta &&
    action.meta.mutations &&
    action.meta.mutations[actionType]
  ) {
    const mutationConfig = action.meta.mutations[actionType];
    const data = updateData(
      state.normalized
        ? getQuery(
            {
              requests: { normalizedData, queries: { [actionType]: state } },
            },
            { type: actionType },
          ).data
        : state.data,
      action,
      mutationConfig,
    );
    return data === state.data ? state : { ...state, data };
  }

  switch (action.type) {
    case success(actionType):
      return action.meta &&
        (action.meta.ssrResponse || action.meta.cacheResponse)
        ? state
        : {
            ...state,
            data: getDataFromResponseAction(action),
            pending: state.pending - 1,
            error: null,
          };

    case error(actionType):
      return {
        ...state,
        data: null,
        pending: state.pending - 1,
        error: action.payload ? action.payload : action.error,
      };
    case abort(actionType):
      return {
        ...state,
        pending: state.pending - 1,
      };
    default:
      return action.meta &&
        (action.meta.ssrResponse || action.meta.cacheResponse)
        ? state
        : {
            ...state,
            pending: state.pending + 1,
            error: null,
          };
  }
};

const maybeGetQueryActionType = (action, config) => {
  if (config.isRequestAction(action) && config.isRequestActionQuery(action)) {
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

const updateNormalizedData = (normalizedData, action, config) => {
  if (
    config.isRequestAction(action) &&
    action.meta &&
    action.meta.optimisticData
  ) {
    const [, newNormalizedData] = normalize(action.meta.optimisticData, config);
    return mergeData(normalizedData, newNormalizedData);
  }

  if (
    isResponseAction(action) &&
    isErrorAction(action) &&
    action.meta.revertedData
  ) {
    const [, newNormalizedData] = normalize(action.meta.revertedData, config);
    return mergeData(normalizedData, newNormalizedData);
  }

  if (
    isResponseAction(action) &&
    isSuccessAction(action) &&
    shouldBeNormalized(action, config) &&
    !config.isRequestActionQuery(getRequestActionFromResponse(action))
  ) {
    const [, newNormalizedData] = normalize(
      getDataFromResponseAction(action),
      config,
    );
    return mergeData(normalizedData, newNormalizedData);
  }

  if (action.meta && action.meta.localData) {
    const [, newNormalizedData] = normalize(action.meta.localData, config);
    return mergeData(normalizedData, newNormalizedData);
  }

  return normalizedData;
};

export default (state, action, config = defaultConfig) => {
  let normalizedData = updateNormalizedData(
    state.normalizedData,
    action,
    config,
  );

  if (action.meta && action.meta.mutations) {
    return {
      queries: {
        ...state.queries,
        ...Object.keys(action.meta.mutations)
          .filter(actionType => !!state.queries[actionType])
          .reduce((prev, actionType) => {
            const updatedQuery = queryReducer(
              state.queries[actionType],
              action,
              actionType,
              config,
              normalizedData,
            );

            if (
              updatedQuery.normalized &&
              updatedQuery.data !== state.queries[actionType].data
            ) {
              const [newdata, newNormalizedData, usedKeys] = normalize(
                updatedQuery.data,
                config,
              );
              normalizedData = mergeData(normalizedData, newNormalizedData);
              prev[actionType] = { ...updatedQuery, data: newdata, usedKeys };
            } else {
              prev[actionType] = updatedQuery;
            }
            return prev;
          }, {}),
      },
      normalizedData,
    };
  }

  const queryActionType = maybeGetQueryActionType(action, config);

  if (queryActionType) {
    const queryType =
      action.meta && typeof action.meta.requestKey !== 'undefined'
        ? queryActionType + action.meta.requestKey
        : queryActionType;
    const updatedQuery = queryReducer(
      state.queries[queryType],
      action,
      queryActionType,
      config,
    );

    if (
      updatedQuery.normalized &&
      updatedQuery.data &&
      (!state.queries[queryType] ||
        state.queries[queryType].data !== updatedQuery.data)
    ) {
      const [data, newNormalizedData, usedKeys] = normalize(
        updatedQuery.data,
        config,
      );

      return {
        queries: {
          ...state.queries,
          [queryType]: { ...updatedQuery, data, usedKeys },
        },
        normalizedData: mergeData(normalizedData, newNormalizedData),
      };
    }

    return {
      queries: {
        ...state.queries,
        [queryType]: updatedQuery,
      },
      normalizedData,
    };
  }

  return state.normalizedData === normalizedData
    ? state
    : {
        ...state,
        normalizedData,
      };
};
