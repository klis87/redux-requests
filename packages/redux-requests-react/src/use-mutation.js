import { useCallback, useMemo, useEffect } from 'react';
import { useSelector, useStore } from 'react-redux';
import {
  getMutationSelector,
  resetRequests,
  addWatcher,
  removeWatcher,
} from '@redux-requests/core';

import useDispatchRequest from './use-dispatch-request';

const emptyVariables = [];

const useMutation = ({ variables = emptyVariables, ...selectorProps }) => {
  const dispatchRequest = useDispatchRequest();
  const store = useStore();

  const dispatchMutation = useCallback(() => {
    return dispatchRequest(
      (selectorProps.action || selectorProps.type)(...variables),
    );
  }, [selectorProps.action, selectorProps.type, ...variables]);

  const mutation = useSelector(getMutationSelector(selectorProps));

  useEffect(() => {
    const key = selectorProps.type + (selectorProps.requestKey || '');
    dispatchRequest(addWatcher(key));

    return () => {
      dispatchRequest(removeWatcher(key));

      if (!store.getState().requests.watchers[key]) {
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

  return useMemo(
    () => ({
      ...mutation,
      mutate: dispatchMutation,
    }),
    [mutation, dispatchMutation],
  );
};

export default useMutation;
