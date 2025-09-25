import { createSelectorCreator, defaultMemoize } from 'reselect';

import { denormalize, getDependentKeys } from '../normalizers';

const isQueryEqual = (currentVal, previousVal) => {
  if (
    currentVal.data !== previousVal.data ||
    currentVal.pending !== previousVal.pending ||
    currentVal.error !== previousVal.error ||
    currentVal.pristine !== previousVal.pristine ||
    currentVal.downloadProgress !== previousVal.downloadProgress ||
    currentVal.uploadProgress !== previousVal.uploadProgress
  ) {
    return false;
  }

  if (
    currentVal.normalized &&
    currentVal.normalizedData !== previousVal.normalizedData
  ) {
    const currentDependencies = getDependentKeys(
      currentVal.data,
      currentVal.normalizedData,
      currentVal.usedKeys,
    );
    const previousDependencies = getDependentKeys(
      previousVal.data,
      previousVal.normalizedData,
      previousVal.usedKeys,
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

const createCustomSelector = createSelectorCreator(
  defaultMemoize,
  isQueryEqual,
);

const getQueryState = (state, type, requestKey = '') =>
  state.requests.queries[type + requestKey];

const createQuerySelector = (type, requestKey) =>
  createCustomSelector(
    state => {
      // in order not to keep queryState.ref reference in selector memoize
      const {
        data,
        pending,
        error,
        pristine,
        normalized,
        usedKeys,
      } = getQueryState(state, type, requestKey);

      return {
        data,
        pending,
        error,
        pristine,
        normalized,
        usedKeys,
        normalizedData: state.requests.normalizedData,
        downloadProgress:
          state.requests.downloadProgress[type + (requestKey || '')] ?? null,
        uploadProgress:
          state.requests.uploadProgress[type + (requestKey || '')] ?? null,
      };
    },
    ({
      data,
      pending,
      error,
      pristine,
      usedKeys,
      normalized,
      normalizedData,
      downloadProgress,
      uploadProgress,
    }) => ({
      data: normalized ? denormalize(data, normalizedData, usedKeys) : data,
      pending,
      loading: pending > 0,
      error,
      pristine,
      downloadProgress,
      uploadProgress,
    }),
  );

const defaultQuery = {
  data: null,
  pending: 0,
  loading: false,
  error: null,
  pristine: true,
  downloadProgress: null,
  uploadProgress: null,
};

const querySelectors = new WeakMap();

export default (state, { type, requestKey }) => {
  const queryState = getQueryState(state, type, requestKey);

  if (!queryState) {
    return defaultQuery;
  }

  if (!querySelectors.get(queryState.ref)) {
    querySelectors.set(queryState.ref, createQuerySelector(type, requestKey));
  }

  return querySelectors.get(queryState.ref)(state);
};
