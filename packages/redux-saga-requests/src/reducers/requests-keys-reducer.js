import { isRequestAction, isRequestActionQuery } from '../actions';

// TODO: this should be rewritten to more functional style, we need things like filter object helpers
export default (state, action) => {
  if (
    isRequestAction(action) &&
    action.meta &&
    action.meta.requestKey !== undefined
  ) {
    let { queries, mutations, requestsKeys } = state;

    if (!requestsKeys[action.type]) {
      requestsKeys = {
        ...requestsKeys,
        [action.type]: [action.meta.requestKey],
      };
    } else if (!requestsKeys[action.type].includes(action.meta.requestKey)) {
      requestsKeys = {
        ...requestsKeys,
        [action.type]: [...requestsKeys[action.type], action.meta.requestKey],
      };
    }

    if (
      action.meta.requestsCapacity &&
      requestsKeys[action.type].length > action.meta.requestsCapacity
    ) {
      const isQuery = isRequestActionQuery(action);
      const requestsStorage = isQuery ? queries : mutations;

      const numberOfExceedingRequests =
        requestsKeys[action.type].length - action.meta.requestsCapacity;

      const exceedingRequestsKeys = requestsKeys[action.type]
        .slice(0, numberOfExceedingRequests)
        .filter(k => {
          const exceededRequest = requestsStorage[action.type + k];
          return !exceededRequest || exceededRequest.pending === 0; // we dont want to remove pending requests
        });

      if (exceedingRequestsKeys.length > 0) {
        requestsKeys = {
          ...requestsKeys,
          [action.type]: requestsKeys[action.type].filter(
            k => !exceedingRequestsKeys.includes(k),
          ),
        };
        const copiedStorage = { ...requestsStorage };

        exceedingRequestsKeys.forEach(k => {
          delete copiedStorage[action.type + k];
        });

        if (isQuery) {
          queries = copiedStorage;
        } else {
          mutations = copiedStorage;
        }
      }
    }

    return { queries, mutations, requestsKeys };
  }

  return state;
};
