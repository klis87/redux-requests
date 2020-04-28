import { isSuccessAction, isResponseAction } from '../actions';

const getDataUpdater = mutationConfig => {
  if (typeof mutationConfig === 'function') {
    return mutationConfig;
  } else if (mutationConfig.updateData) {
    return mutationConfig.updateData;
  }

  return null;
};

export default (data, action, mutationConfig) => {
  if (isResponseAction(action)) {
    if (isSuccessAction(action)) {
      const dataUpdater = getDataUpdater(mutationConfig);

      return dataUpdater
        ? dataUpdater(
            data,
            action.payload ? action.payload.data : action.response.data,
          )
        : data;
    }

    // error or abort case
    return mutationConfig.revertData ? mutationConfig.revertData(data) : data;
  }

  if (mutationConfig.updateDataOptimistic) {
    return mutationConfig.updateDataOptimistic(data);
  }

  if (mutationConfig.local) {
    return getDataUpdater(mutationConfig)(data);
  }

  return data;
};
