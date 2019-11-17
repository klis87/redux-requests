import { createSelector } from 'reselect';

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

export default (state, { type, requestKey }) => {
  if (!mutationSelectors[type]) {
    mutationSelectors[type] = createMutationSelector(type);
  }

  return mutationSelectors[type](state, requestKey);
};
