const createRequest = requestType => (name, requestConfig, metaConfig) => {
  const actionCreator = (...params) => ({
    type: name,
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
  actionCreator.toString = () => name;
  return actionCreator;
};

export const createQuery = createRequest('QUERY');
export const createMutation = createRequest('MUTATION');
export const createSubscription = createRequest('SUBSCRIPTION');
