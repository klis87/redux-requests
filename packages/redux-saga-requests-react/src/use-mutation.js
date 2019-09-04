import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getMutation } from 'redux-saga-requests';

const useMutation = ({ type, requestKey }) => {
  const mutationSelector = useMemo(() => getMutation({ type, requestKey }), [
    type,
    requestKey,
  ]);

  return useSelector(mutationSelector);
};

export default useMutation;
