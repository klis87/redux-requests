import { useEffect, useCallback, useMemo } from 'react';
import { useSelector, useStore } from 'react-redux';
import {
  getQuerySelector,
  resetRequests,
  addWatcher,
  removeWatcher,
  joinRequest,
} from '@redux-requests/core';

import useDispatchRequest from './use-dispatch-request';

const emptyVariables = [];

const useQuery = ({
  variables = emptyVariables,
  dispatch = false,
  suspense = false,
  ...selectorProps
}) => {
  const dispatchRequest = useDispatchRequest();
  const store = useStore();

  const key = `${selectorProps.type}${selectorProps.requestKey || ''}`;

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

  if (suspense && typeof window !== 'undefined' && query.loading) {
    throw dispatchRequest(joinRequest(key));
  }

  if (
    suspense &&
    typeof window === 'undefined' &&
    (query.loading || query.pristine)
  ) {
    if (dispatch && query.pristine) {
      throw dispatchQuery();
    }

    throw dispatchRequest(joinRequest(key, dispatch));
  }

  return useMemo(
    () => ({
      ...query,
      load: dispatchQuery,
    }),
    [query, dispatchQuery],
  );
};

export default useQuery;
