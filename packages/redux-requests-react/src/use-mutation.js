import { useCallback, useMemo, useEffect, useContext } from 'react';
import { useSelector, useStore } from 'react-redux';
import {
  getMutationSelector,
  resetRequests,
  addWatcher,
  removeWatcher,
  joinRequest,
} from '@redux-requests/core';

import useDispatch from './use-dispatch';
import RequestsContext from './requests-context';

const emptyVariables = [];

const useMutation = ({
  variables = emptyVariables,
  autoReset,
  throwError,
  suspense,
  ...selectorProps
}) => {
  const requestContext = useContext(RequestsContext);

  suspense = suspense === undefined ? requestContext.suspense : suspense;
  autoReset = autoReset === undefined ? requestContext.autoReset : autoReset;
  throwError =
    throwError === undefined ? requestContext.throwError : throwError;

  const dispatch = useDispatch();
  const store = useStore();

  const key = `${selectorProps.type}${selectorProps.requestKey || ''}`;

  const dispatchMutation = useCallback(() => {
    return dispatch(selectorProps.type(...variables));
  }, [selectorProps.type, ...variables]);

  const mutation = useSelector(getMutationSelector(selectorProps));

  useEffect(() => {
    dispatch(addWatcher(key));

    return () => {
      dispatch(removeWatcher(key));

      if (autoReset && !store.getState().requests.watchers[key]) {
        dispatch(
          resetRequests(
            [
              {
                requestType: selectorProps.type,
                requestKey: selectorProps.requestKey,
              },
            ],
            false,
          ),
        );
      }
    };
  }, [selectorProps.type, selectorProps.requestKey]);

  if (suspense && mutation.loading) {
    throw dispatch(joinRequest(key));
  }

  if (throwError && mutation.error) {
    throw {
      error: mutation.error,
      type: selectorProps.type,
      requestKey: selectorProps.requestKey,
    };
  }

  return useMemo(
    () => ({
      ...mutation,
      mutate: dispatchMutation,
    }),
    [mutation, dispatchMutation],
  );
};

export default useMutation;
