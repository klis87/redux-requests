import { useEffect } from 'react';
import { useStore } from 'react-redux';
import {
  addWatcher,
  removeWatcher,
  stopSubscriptions,
} from '@redux-requests/core';

import useDispatch from './use-dispatch';

const emptyVariables = [];

const useSubscriptions = ({
  variables = emptyVariables,
  type,
  requestKey,
  active = true,
}) => {
  const dispatch = useDispatch();
  const store = useStore();

  const key = `${type}${requestKey || ''}`;

  useEffect(() => {
    if (active) {
      dispatch(type(...variables));
    }
  }, [active, type, ...variables]);

  useEffect(() => {
    dispatch(addWatcher(key));

    return () => {
      dispatch(removeWatcher(key));

      if (!store.getState().requests.watchers[key]) {
        dispatch(stopSubscriptions([key]));
      }
    };
  }, [type, requestKey]);
};

export default useSubscriptions;
