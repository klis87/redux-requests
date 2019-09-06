import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getMutation } from 'redux-saga-requests';

const useMutation = ({ requestSelector, type, requestKey }) => {
  const mutationSelector = useMemo(
    () => getMutation({ requestSelector, type, requestKey }),
    [requestSelector, type, requestKey],
  );

  return useSelector(mutationSelector);
};

export default useMutation;
