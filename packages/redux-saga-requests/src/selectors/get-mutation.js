import { createSelector } from 'reselect';

const defaultMutation = {
  loading: false,
  error: null,
};

const getMutationState = (state, type, requestKey = '') =>
  state.requests.mutations[type + requestKey];

const mutationSelectors = new WeakMap();

const createMutationSelector = (type, requestKey) =>
  createSelector(
    state => getMutationState(state, type, requestKey),
    mutationState => ({
      loading: mutationState.pending > 0,
      error: mutationState.error,
    }),
  );

export default (state, { type, requestKey }) => {
  const mutationState = getMutationState(state, type, requestKey);

  if (!mutationState) {
    return defaultMutation;
  }

  if (!mutationSelectors.get(mutationState.ref)) {
    mutationSelectors.set(
      mutationState.ref,
      createMutationSelector(type, requestKey),
    );
  }

  return mutationSelectors.get(mutationState.ref)(state);
};
