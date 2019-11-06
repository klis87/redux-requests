import { useSelector } from 'react-redux';
import { getQuery } from 'redux-saga-requests';

const useQuery = props => {
  return useSelector(state => getQuery(state, props));
};

export default useQuery;
