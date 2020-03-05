import { useSelector } from 'react-redux';
import { getMutationSelector } from 'redux-saga-requests';

const useMutation = props => {
  return useSelector(getMutationSelector(props));
};

export default useMutation;
