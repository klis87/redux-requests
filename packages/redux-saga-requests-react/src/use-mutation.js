import { useSelector } from 'react-redux';
import { getMutation } from 'redux-saga-requests';

const useMutation = props => {
  return useSelector(state => getMutation(state, props));
};

export default useMutation;
