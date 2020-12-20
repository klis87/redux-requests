import { createSelector } from 'reselect';

const defaultMutation = {
  loading: false,
  pending: 0,
  error: null,
  downloadProgress: null,
  uploadProgress: null,
};

const getMutationState = (state, type, requestKey = '') =>
  state.requests.mutations[type + requestKey];

const mutationSelectors = new WeakMap();

const createMutationSelector = (type, requestKey) =>
  createSelector(
    state => getMutationState(state, type, requestKey),
    state => state.requests.downloadProgress[type + (requestKey || '')] ?? null,
    state => state.requests.uploadProgress[type + (requestKey || '')] ?? null,
    (mutationState, downloadProgress, uploadProgress) => ({
      pending: mutationState.pending,
      loading: mutationState.pending > 0,
      error: mutationState.error,
      downloadProgress,
      uploadProgress,
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
