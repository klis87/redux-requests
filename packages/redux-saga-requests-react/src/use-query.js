import { useSelector } from 'react-redux';
import { getQuerySelector } from 'redux-saga-requests';

const useQuery = props => {
  return useSelector(getQuerySelector(props));
};

export default useQuery;
