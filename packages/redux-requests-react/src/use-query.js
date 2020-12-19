import { useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { getQuerySelector } from '@redux-requests/core';

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

  return {
    ...useSelector(getQuerySelector(selectorProps)),
    load: dispatchQuery,
  };
};

export default useQuery;
