import { useEffect, useCallback, useMemo } from 'react';
import { useSelector, useStore } from 'react-redux';
import {
  getQuerySelector,
  resetRequests,
  addWatcher,
  removeWatcher,
} from '@redux-requests/core';

import useDispatchRequest from './use-dispatch-request';

const emptyVariables = [];

const useQuery = ({
  variables = emptyVariables,
  dispatch = false,
  ...selectorProps
}) => {
  const dispatchRequest = useDispatchRequest();
  const store = useStore();

  const dispatchQuery = useCallback(() => {
    if (dispatch) {
      return dispatchRequest(
        (selectorProps.action || selectorProps.type)(...variables),
      );
    }

    return Promise.resolve(null);
  }, [dispatch, selectorProps.action, selectorProps.type, ...variables]);

  useEffect(() => {
    if (dispatch) {
      dispatchQuery();
    }
  }, [dispatch, dispatchQuery]);

  const query = useSelector(getQuerySelector(selectorProps));

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
            true,
            false,
          ),
        );
      }
    };
  }, [selectorProps.type, selectorProps.requestKey]);

  return useMemo(
    () => ({
      ...query,
      load: dispatchQuery,
    }),
    [query, dispatchQuery],
  );
};

export default useQuery;
