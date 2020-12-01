import defaultConfig from '../default-config';

// TODO: this should be rewritten to more functional style, we need things like filter object helpers
export default (state, action, config = defaultConfig) => {
  if (config.isRequestAction(action) && action.meta?.requestKey !== undefined) {
    let { queries, mutations, cache, requestsKeys } = state;

    if (!requestsKeys[action.type]) {
      requestsKeys = {
        ...requestsKeys,
        [action.type]: [action.meta.requestKey],
      };
    } else {
      requestsKeys = {
        ...requestsKeys,
        [action.type]: [
          ...requestsKeys[action.type].filter(
            k => k !== action.meta.requestKey,
          ),
          action.meta.requestKey,
        ],
      };
    }

    if (
      action.meta.requestsCapacity &&
      requestsKeys[action.type].length > action.meta.requestsCapacity
    ) {
      const isQuery = config.isRequestActionQuery(action);
      const requestsStorage = isQuery ? queries : mutations;

      const numberOfExceedingRequests =
        requestsKeys[action.type].length - action.meta.requestsCapacity;

      if (numberOfExceedingRequests > 0) {
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

            const copiedCache = { ...cache };

            exceedingRequestsKeys.forEach(k => {
              delete copiedCache[action.type + k];
            });

            cache = copiedCache;
          } else {
            mutations = copiedStorage;
          }
        }
      }
    }

    return {
      queries,
      mutations,
      cache,
      requestsKeys,
      downloadProgress: state.downloadProgress,
      uploadProgress: state.uploadProgress,
    };
  }

  return state;
};
