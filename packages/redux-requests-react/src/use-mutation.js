import { useCallback, useMemo, useEffect, useContext } from 'react';
import { useSelector, useStore } from 'react-redux';
import {
  getMutationSelector,
  resetRequests,
  addWatcher,
  removeWatcher,
  joinRequest,
} from '@redux-requests/core';

import useDispatchRequest from './use-dispatch-request';
import RequestsContext from './requests-context';

const emptyVariables = [];

const useMutation = ({
  variables = emptyVariables,
  autoReset,
  suspense,
  ...selectorProps
}) => {
  const requestContext = useContext(RequestsContext);

  suspense = suspense === undefined ? requestContext.suspense : suspense;
  autoReset = autoReset === undefined ? requestContext.autoReset : autoReset;

  const dispatchRequest = useDispatchRequest();
  const store = useStore();

  const key = `${selectorProps.type}${selectorProps.requestKey || ''}`;

  const dispatchMutation = useCallback(() => {
    return dispatchRequest(
      (selectorProps.action || selectorProps.type)(...variables),
    );
  }, [selectorProps.action, selectorProps.type, ...variables]);

  const mutation = useSelector(getMutationSelector(selectorProps));

  useEffect(() => {
    dispatchRequest(addWatcher(key));

    return () => {
      dispatchRequest(removeWatcher(key));

      if (autoReset && !store.getState().requests.watchers[key]) {
        dispatchRequest(
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
    throw dispatchRequest(joinRequest(key));
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
