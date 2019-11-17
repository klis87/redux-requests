import {
  createSelectorCreator,
  createSelector,
  defaultMemoize,
} from 'reselect';

import { denormalize, getDependentKeys } from './normalizers';

const isEqual = (currentVal, previousVal) => {
  if (currentVal.queryState !== previousVal.queryState) {
    return false;
  }

  if (
    currentVal.queryState.data === null &&
    (currentVal.multiple !== previousVal.multiple ||
      currentVal.defaultData !== previousVal.defaultData)
  ) {
    return false;
  }

  if (
    currentVal.queryState.normalized &&
    currentVal.normalizedData !== previousVal.normalizedData
  ) {
    const currentDependencies = getDependentKeys(
      currentVal.queryState.data,
      currentVal.normalizedData,
      currentVal.queryState.usedKeys,
    );
    const previousDependencies = getDependentKeys(
      previousVal.queryState.data,
      previousVal.normalizedData,
      previousVal.queryState.usedKeys,
    );

    if (currentDependencies.size !== previousDependencies.size) {
      return false;
    }

    for (const k of currentDependencies) {
      if (
        !previousDependencies.has(k) ||
        currentVal.normalizedData[k] !== previousVal.normalizedData[k]
      ) {
        return false;
      }
    }
  }

  return true;
};

const createCustomSelector = createSelectorCreator(defaultMemoize, isEqual);

const defaultQueryState = {
  data: null,
  pending: 0,
  error: null,
  normalized: false,
};

const getData = (data, multiple, defaultData) => {
  if (data !== null) {
    return data;
  }

  if (defaultData !== undefined) {
    return defaultData;
  }

  if (multiple) {
    return [];
  }

  return data;
};

const getQueryState = (state, type) =>
  state.network.queries[type] || defaultQueryState;

const createQuerySelector = type =>
  createCustomSelector(
    (state, defaultData, multiple) => ({
      defaultData,
      multiple,
      queryState: getQueryState(state, type),
      normalizedData: state.network.normalizedData,
    }),
    ({ queryState, normalizedData, defaultData, multiple }) => ({
      data: queryState.normalized
        ? denormalize(
            getData(queryState.data, multiple, defaultData),
            normalizedData,
            queryState.usedKeys,
          )
        : getData(queryState.data, multiple, defaultData),
      loading: queryState.pending > 0,
      error: queryState.error,
    }),
  );

const querySelectors = {};

export const getQuery = (state, { type, defaultData, multiple = false }) => {
  if (!querySelectors[type]) {
    querySelectors[type] = createQuerySelector(type);
  }

  return querySelectors[type](state, defaultData, multiple);
};

const defaultMutation = {
  loading: false,
  error: null,
};

const mutationSelectors = {};

const createMutationSelector = type =>
  createSelector(
    state => state.network.mutations[type],
    (state, requestKey) => requestKey,
    (mutationState, requestKey) => {
      if (!mutationState || (requestKey && !mutationState[requestKey])) {
        return defaultMutation;
      }

      const mutation = requestKey ? mutationState[requestKey] : mutationState;

      return {
        loading: mutation.pending > 0,
        error: mutation.error,
      };
    },
  );

export const getMutation = (state, { type, requestKey }) => {
  if (!mutationSelectors[type]) {
    mutationSelectors[type] = createMutationSelector(type);
  }

  return mutationSelectors[type](state, requestKey);
};
