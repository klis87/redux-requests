import {
  success,
  error,
  abort,
  isSuccessAction,
  isResponseAction,
  getRequestActionFromResponse,
} from '../actions';
import mutationsReducer from './mutations-reducer';
import defaultConfig from './default-config';

// to support libraries like redux-act and redux-actions
const normalizeActionType = actionType =>
  typeof actionType === 'function' ? actionType.toString() : actionType;

const mutationConfigHasRequestKey = config =>
  typeof config !== 'boolean' && !!config.getRequestKey;

const getInitialState = ({
  getDefaultData,
  multiple,
  mutations,
  handleMutationsState,
}) => ({
  data: getDefaultData(multiple),
  pending: 0,
  error: null,
  mutations:
    handleMutationsState && mutations
      ? Object.entries(mutations)
          .filter(([, v]) => !v.local)
          .reduce(
            (prev, [k, v]) => ({
              ...prev,
              [k]: mutationConfigHasRequestKey(v)
                ? {}
                : { error: null, pending: 0 },
            }),
            {},
          )
      : null,
});

const getDataUpdater = (reducerConfig, mutationConfig) => {
  if (mutationConfig === true || mutationConfig.updateData === true) {
    return reducerConfig.updateData || reducerConfig.getData;
  } else if (typeof mutationConfig === 'function') {
    return mutationConfig;
  } else if (
    typeof mutationConfig !== 'boolean' &&
    typeof mutationConfig.updateData === 'function'
  ) {
    return mutationConfig.updateData;
  }

  return null;
};

const requestMutationReducer = (state, action, config) => {
  const mutationConfig = config.mutations[action.type];

  if (mutationConfig.updateDataOptimistic) {
    return {
      ...state,
      data: mutationConfig.updateDataOptimistic(state, action, config),
    };
  }

  if (mutationConfig.local) {
    const dataUpdater = getDataUpdater(config, mutationConfig);

    return {
      ...state,
      data: dataUpdater(state, action, config),
    };
  }

  return state;
};

const responseMutationReducer = (state, action, config) => {
  const requestAction = getRequestActionFromResponse(action);
  const mutationConfig = config.mutations[requestAction.type];

  if (isSuccessAction(action)) {
    const dataUpdater = getDataUpdater(config, mutationConfig);

    return dataUpdater
      ? {
          ...state,
          data: dataUpdater(state, action, config),
        }
      : state;
  }

  // error or abort case
  return mutationConfig.revertData
    ? {
        ...state,
        data: mutationConfig.revertData(state, action, config),
      }
    : state;
};

export default localConfig => {
  const config = { ...defaultConfig, ...localConfig };
  const normalizedActionType = normalizeActionType(config.actionType);
  const shouldActionBeReset =
    typeof config.resetOn === 'function'
      ? config.resetOn
      : action => config.resetOn.map(normalizeActionType).includes(action.type);

  return (state, action) => {
    if (
      action.meta &&
      action.meta.mutations &&
      normalizedActionType in action.meta.mutations &&
      (!config.mutations || !(normalizedActionType in config.mutations))
    ) {
      config.mutations = {
        ...config.mutations,
        [action.type]: action.meta.mutations[normalizedActionType],
      };
    }

    let nextState = state || getInitialState(config);

    if (shouldActionBeReset(action)) {
      nextState = {
        ...getInitialState(config),
        pending: nextState.pending,
      };
    }

    const requestAction = isResponseAction(action)
      ? getRequestActionFromResponse(action)
      : action;

    if (config.mutations && requestAction.type in config.mutations) {
      return {
        ...(isResponseAction(action)
          ? responseMutationReducer(nextState, action, config)
          : requestMutationReducer(nextState, action, config)),
        mutations: config.handleMutationsState
          ? mutationsReducer(
              nextState.mutations,
              action,
              config,
              config.mutations[requestAction.type],
            )
          : null,
      };
    }

    switch (action.type) {
      case normalizedActionType:
        return config.onRequest(nextState, action, config);
      case success(normalizedActionType):
        return config.onSuccess(nextState, action, config);
      case error(normalizedActionType):
        return config.onError(nextState, action, config);
      case abort(normalizedActionType):
        return config.onAbort(nextState, action, config);
      default:
        return nextState;
    }
  };
};
