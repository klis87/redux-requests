import { useMemo } from 'react';
import { useSelector } from 'react-redux';

const defaultQuery = {
  data: null,
  error: null,
  pending: 0,
};

// to ignore `mutations` changes
const areQueriesEqual = (left, right) =>
  left.data === right.data &&
  left.pending === right.pending &&
  left.error === right.error;

const useQuery = ({ requestSelector, type }) => {
  const requestState = useSelector(
    state =>
      requestSelector
        ? requestSelector(state)
        : state.network.queries[type] || defaultQuery,
    areQueriesEqual,
  );

  // to be friendly with memo/PureComponent optimisations
  return useMemo(
    () => ({
      data: requestState.data,
      loading: requestState.pending > 0,
      error: requestState.error,
    }),
    [requestState],
  );
};

export default useQuery;
