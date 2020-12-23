import { useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getQuerySelector, resetRequests } from '@redux-requests/core';

import useDispatchRequest from './use-dispatch-request';

const emptyVariables = [];

const useQuery = ({
  variables = emptyVariables,
  dispatch = false,
  ...selectorProps
}) => {
  const dispatchRequest = useDispatchRequest();

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
    return () => {
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
