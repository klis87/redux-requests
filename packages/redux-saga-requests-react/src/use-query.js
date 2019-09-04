import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getQuery } from 'redux-saga-requests';

const useQuery = ({ type, defaultData, multiple }) => {
  const querySelector = useMemo(
    () => getQuery({ type, defaultData, multiple }),
    [type, defaultData, multiple],
  );

  return useSelector(querySelector);
};

export default useQuery;
