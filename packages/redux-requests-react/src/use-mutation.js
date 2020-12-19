import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getMutationSelector } from '@redux-requests/core';

import useDispatchRequest from './use-dispatch-request';

const emptyVariables = [];

const useMutation = ({ variables = emptyVariables, ...selectorProps }) => {
  const dispatchRequest = useDispatchRequest();

  const dispatchMutation = useCallback(() => {
    return dispatchRequest(
      (selectorProps.action || selectorProps.type)(...variables),
    );
  }, [selectorProps.action, selectorProps.type, ...variables]);

  const mutation = useSelector(getMutationSelector(selectorProps));

  return useMemo(
    () => ({
      ...mutation,
      mutate: dispatchMutation,
    }),
    [mutation, dispatchMutation],
  );
};

export default useMutation;
