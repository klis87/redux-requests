import { useMemo } from 'react';
import { useSelector } from 'react-redux';

const defaultMutation = {
  pending: 0,
  error: null,
};

const useMutation = ({ requestSelector, type, requestKey }) => {
  const mutation = useSelector(state => {
    const mutationState = requestSelector
      ? requestSelector(state).mutations[type]
      : state.network.mutations[type];

    if (!mutationState || (requestKey && !mutationState[requestKey])) {
      return defaultMutation;
    }

    return requestKey ? mutationState[requestKey] : mutationState;
  });

  // to be friendly with memo/PureComponent optimisations
  return useMemo(
    () => ({
      loading: mutation.pending > 0,
      error: mutation.error,
    }),
    [mutation],
  );
};

export default useMutation;
