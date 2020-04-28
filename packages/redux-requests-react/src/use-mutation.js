import { useSelector } from 'react-redux';
import { getMutationSelector } from '@redux-requests/core';

const useMutation = props => {
  return useSelector(getMutationSelector(props));
};

export default useMutation;
