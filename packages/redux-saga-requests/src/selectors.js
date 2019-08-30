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

export const getQuery = ({
  requestSelector,
  type,
  defaultData,
  multiple = false,
}) =>
  createSelector(
    state =>
      requestSelector
        ? requestSelector(state)
        : state.network.queries[type] || defaultQueryState,
    queryState => ({
      data: getData(queryState.data, multiple, defaultData),
      loading:
        queryState.pending === undefined
          ? queryState.loading
          : queryState.pending > 0,
      error: queryState.error,
    }),
  );

const defaultMutation = {
  loading: false,
  error: null,
};

export const getMutation = ({ requestSelector, type, requestKey }) =>
  createSelector(
    state =>
      requestSelector
        ? requestSelector(state).mutations[type]
        : state.network.mutations[type],
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
