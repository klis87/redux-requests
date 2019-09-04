import { createSelector } from 'reselect';

const defaultQueryState = {
  data: null,
  pending: 0,
  error: null,
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

export const getQuery = ({ type, defaultData, multiple = false }) =>
  createSelector(
    state => state.network.queries[type] || defaultQueryState,
    queryState => ({
      data: getData(queryState.data, multiple, defaultData),
      loading: queryState.pending > 0,
      error: queryState.error,
    }),
  );

const defaultMutation = {
  loading: false,
  error: null,
};

export const getMutation = ({ type, requestKey }) =>
  createSelector(
    state => state.network.mutations[type],
    mutationContainer => {
      if (
        !mutationContainer ||
        (requestKey && !mutationContainer[requestKey])
      ) {
        return defaultMutation;
      }

      const mutation = requestKey
        ? mutationContainer[requestKey]
        : mutationContainer;

      return {
        loading: mutation.pending > 0,
        error: mutation.error,
      };
    },
  );
