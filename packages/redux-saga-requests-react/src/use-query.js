import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getQuery } from 'redux-saga-requests';

const useQuery = ({ requestSelector, type, defaultData, multiple }) => {
  const querySelector = useMemo(
    () => getQuery({ requestSelector, type, defaultData, multiple }),
    [(requestSelector, type, defaultData, multiple)],
  );

  return useSelector(querySelector);
};

export default useQuery;
