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
import { getQuery } from '../selectors';
import { normalize, mergeData, getDependentKeys } from '../normalizers';
import { mapObject } from '../helpers';

import updateData from './update-data';

const getInitialQuery = normalized => ({
  data: null,
  pending: 0,
  error: null,
  pristine: true,
  ref: {},
  normalized,
  usedKeys: normalized ? {} : null,
  dependencies: normalized ? [] : null,
});

const shouldBeNormalized = (action, config) =>
  action.meta?.normalize !== undefined
    ? action.meta.normalize
    : config.normalize;

const addQueryAsDependency = (dependentQueries, dependencies, queryType) => {
  dependencies.forEach(dependency => {
    if (!dependentQueries[dependency]) {
      dependentQueries = { ...dependentQueries, [dependency]: [queryType] };
    }

    if (!dependentQueries[dependency].includes(queryType)) {
      dependentQueries = {
        ...dependentQueries,
        [dependency]: [...dependentQueries[dependency], queryType],
      };
    }
  });

  return dependentQueries;
};

const removeQueryAsDependency = (dependentQueries, dependencies, queryType) => {
  dependencies.forEach(dependency => {
    if (dependentQueries[dependency].length > 1) {
      dependentQueries = {
        ...dependentQueries,
        [dependency]: dependentQueries[dependency].filter(v => v !== queryType),
      };
    } else {
      dependentQueries = mapObject(dependentQueries, (k, v) =>
        k === dependency ? undefined : v,
      );
    }
  });

  return dependentQueries;
};

const getDependenciesDiff = (oldDependencies, newDependencies) => {
  return {
    addedDependencies: newDependencies.filter(
      v => !oldDependencies.includes(v),
    ),
    removedDependencies: oldDependencies.filter(
      v => !newDependencies.includes(v),
    ),
  };
};

const queryReducer = (state, action, actionType, config, normalizedData) => {
  if (state === undefined) {
    state = getInitialQuery(shouldBeNormalized(action, config));
  }

  if (action.meta?.mutations?.[actionType]) {
    const mutationConfig = action.meta.mutations[actionType];
    const data = updateData(
      state.normalized
        ? getQuery(
            {
              requests: {
                normalizedData,
                queries: { [actionType]: state },
                downloadProgress: {},
                uploadProgress: {},
              },
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
      return action.meta?.ssrResponse || action.meta?.cacheResponse
        ? state
        : {
            ...state,
            data: action.response.data,
            pending: state.pending - 1,
            error: null,
          };

    case error(actionType):
      return action.meta?.ssrError
        ? state
        : {
            ...state,
            data: null,
            pending: state.pending - 1,
            error: action.error,
          };
    case abort(actionType): {
      if (state.pending === 1 && state.data === null && state.error === null) {
        return undefined;
      }

      return {
        ...state,
        pending: state.pending - 1,
      };
    }
    default:
      return action.meta?.ssrResponse ||
        action.meta?.ssrError ||
        action.meta?.cacheResponse
        ? state
        : {
            ...state,
            pending: state.pending + 1,
            error: null,
            pristine: false,
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

const maybeGetMutationData = (action, config) => {
  if (config.isRequestAction(action) && action.meta?.optimisticData) {
    return action.meta.optimisticData;
  }

  if (
    isResponseAction(action) &&
    isErrorAction(action) &&
    action.meta.revertedData
  ) {
    return action.meta.revertedData;
  }

  if (
    isResponseAction(action) &&
    isSuccessAction(action) &&
    shouldBeNormalized(action, config) &&
    !config.isRequestActionQuery(getRequestActionFromResponse(action))
  ) {
    return action.response.data;
  }

  if (action.meta?.localData) {
    return action.meta.localData;
  }

  return null;
};

const updateNormalizedData = (normalizedData, mutationData, config) => {
  const [, newNormalizedData] = normalize(mutationData, config);
  return mergeData(normalizedData, newNormalizedData);
};

const getQueriesDependentOnMutation = (
  dependentQueries,
  mutationDependencies,
) => {
  const queries = [];
  const orphanDependencies = [];

  mutationDependencies.forEach(dependency => {
    if (dependentQueries[dependency]) {
      queries.push(...dependentQueries[dependency]);
    } else {
      orphanDependencies.push(dependency);
    }
  });

  return { foundQueries: [...new Set(queries)], orphanDependencies };
};

export default (state, action, config = defaultConfig) => {
  let { normalizedData, queries, dependentQueries } = state;
  const mutationDataToNormalize = maybeGetMutationData(action, config);

  if (mutationDataToNormalize) {
    const [, mutationNormalizedData] = normalize(
      mutationDataToNormalize,
      config,
    );
    const mutationDependencies = Object.keys(mutationNormalizedData);
    const { foundQueries, orphanDependencies } = getQueriesDependentOnMutation(
      dependentQueries,
      mutationDependencies,
    );
    const recalculatedQueries = {};
    normalizedData = updateNormalizedData(
      normalizedData,
      mutationDataToNormalize,
      config,
    );
    const potentialDependenciesToRemove = new Set(orphanDependencies);

    foundQueries.forEach(query => {
      // const [newdata, newNormalizedData, usedKeys] = normalize(
      //   queries[query],
      //   config,
      // );

      const dependencies = [
        ...getDependentKeys(
          queries[query].data,
          normalizedData,
          queries[query].usedKeys,
        ),
      ];

      const { addedDependencies, removedDependencies } = getDependenciesDiff(
        queries[query].dependencies,
        dependencies,
      );

      removedDependencies.forEach(v => {
        potentialDependenciesToRemove.add(v);
      });

      dependentQueries = addQueryAsDependency(
        dependentQueries,
        addedDependencies,
        query,
      );

      dependentQueries = removeQueryAsDependency(
        dependentQueries,
        removedDependencies,
        query,
      );

      recalculatedQueries[query] = {
        ...queries[query],
        dependencies,
      };
    });

    queries = { ...queries, ...recalculatedQueries };

    const reallyRemovedDeps = [...potentialDependenciesToRemove].filter(
      v => !dependentQueries[v],
    );
    normalizedData = mapObject(normalizedData, (k, v) =>
      reallyRemovedDeps.includes(k) ? undefined : v,
    );
  }

  if (action.meta?.mutations) {
    return {
      queries: {
        ...queries,
        ...Object.keys(action.meta.mutations)
          .filter(actionType => !!queries[actionType])
          .reduce((prev, actionType) => {
            const updatedQuery = queryReducer(
              queries[actionType],
              action,
              actionType,
              config,
              normalizedData,
            );

            if (
              updatedQuery.normalized &&
              updatedQuery.data !== queries[actionType].data
            ) {
              const [newdata, newNormalizedData, usedKeys] = normalize(
                updatedQuery.data,
                config,
              );
              const dependencies = [
                ...getDependentKeys(newdata, newNormalizedData, usedKeys),
              ];
              normalizedData = mergeData(normalizedData, newNormalizedData);
              prev[actionType] = {
                ...updatedQuery,
                data: newdata,
                dependencies,
                usedKeys,
              };

              dependentQueries = addQueryAsDependency(
                dependentQueries,
                dependencies,
                actionType,
              );
            } else {
              prev[actionType] = updatedQuery;
            }
            return prev;
          }, {}),
      },
      normalizedData,
      dependentQueries,
    };
  }

  const queryActionType = maybeGetQueryActionType(action, config);

  if (queryActionType) {
    const queryType =
      action.meta?.requestKey !== undefined
        ? queryActionType + action.meta.requestKey
        : queryActionType;
    const updatedQuery = queryReducer(
      queries[queryType],
      action,
      queryActionType,
      config,
    );

    if (updatedQuery === undefined) {
      // eslint-disable-next-line no-unused-vars
      const { [queryType]: toRemove, ...remainingQueries } = queries;

      return {
        queries: remainingQueries,
        normalizedData,
        dependentQueries,
      };
    }

    if (
      updatedQuery.normalized &&
      updatedQuery.data &&
      (!queries[queryType] || queries[queryType].data !== updatedQuery.data)
    ) {
      const [data, newNormalizedData, usedKeys] = normalize(
        updatedQuery.data,
        config,
      );

      const dependencies = [
        ...getDependentKeys(data, newNormalizedData, usedKeys),
      ];

      return {
        queries: {
          ...queries,
          [queryType]: {
            ...updatedQuery,
            data,
            usedKeys,
            dependencies,
          },
        },
        normalizedData: mergeData(normalizedData, newNormalizedData),
        dependentQueries: addQueryAsDependency(
          dependentQueries,
          dependencies,
          queryType,
        ),
      };
    }

    return {
      queries: {
        ...queries,
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
        queries,
        dependentQueries,
      };
};
