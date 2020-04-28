import { useSelector } from 'react-redux';
import { getQuerySelector } from '@redux-requests/core';

const useQuery = props => {
  return useSelector(getQuerySelector(props));
};

export default useQuery;
