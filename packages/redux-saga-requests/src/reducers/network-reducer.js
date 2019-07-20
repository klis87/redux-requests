import {
  isRequestAction,
  isResponseAction,
  getRequestActionFromResponse,
} from '../actions';
import defaultConfig from './default-config';
import requestsReducer from './requests-reducer';
import operationsReducer from './operations-reducer';

const isRequestReadOnly = request =>
  (!request.query &&
    (!request.method || request.method.toLowerCase() === 'get')) ||
  (request.query && !request.query.trim().startsWith('mutation'));

export default localConfig => {
  const config = {
    ...defaultConfig,
    ...localConfig,
    handleOperationsState: false,
  };
  const requestsReducers = {};

  return (state = { queries: {}, mutations: {} }, action) => {
    if (
      isRequestAction(action) &&
      isRequestReadOnly(action.request) &&
      !(action.type in requestsReducers)
    ) {
      requestsReducers[action.type] = requestsReducer({
        ...config,
        actionType: action.type,
        ...action.meta,
      });
    }

    const queries = Object.entries(requestsReducers).reduce(
      (prev, [actionType, reducer]) => {
        prev[actionType] = reducer(state.queries[actionType], action);
        return prev;
      },
      {},
    );

    let { mutations } = state;

    if (
      (isRequestAction(action) && !isRequestReadOnly(action.request)) ||
      (isResponseAction(action) &&
        !isRequestReadOnly(getRequestActionFromResponse(action).request))
    ) {
      mutations = operationsReducer(mutations, action, config, {
        getRequestKey:
          action.meta &&
          action.meta.operations &&
          action.meta.operations.getRequestKey,
      });
    }

    return {
      queries,
      mutations,
    };
  };
};
