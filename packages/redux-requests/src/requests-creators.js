const createRequest = requestType => (type, requestConfig, metaConfig) => {
  const actionCreator = (...params) => ({
    type,
    payload:
      typeof requestConfig === 'function'
        ? requestConfig(...params)
        : requestConfig,
    meta: {
      ...(typeof metaConfig === 'function'
        ? metaConfig(...params)
        : metaConfig),
      requestType,
    },
  });
  actionCreator.toString = () => type;
  return actionCreator;
};

export const createQuery = createRequest('QUERY');

export const createMutation = createRequest('MUTATION');

export const createSubscription = createRequest('SUBSCRIPTION');

export const createLocalMutation = (type, metaConfig) => {
  const actionCreator = (...params) => ({
    type,
    meta: {
      ...(typeof metaConfig === 'function'
        ? metaConfig(...params)
        : metaConfig),
      requestType: 'LOCAL_MUTATION',
    },
  });
  actionCreator.toString = () => type;
  return actionCreator;
};
