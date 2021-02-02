import { useEffect } from 'react';
import { useStore } from 'react-redux';
import {
  addWatcher,
  removeWatcher,
  stopSubscriptions,
} from '@redux-requests/core';

import useDispatchRequest from './use-dispatch-request';

const emptyVariables = [];

const useSubscriptions = ({
  variables = emptyVariables,
  type,
  requestKey,
  action,
  active = true,
}) => {
  const dispatchRequest = useDispatchRequest();
  const store = useStore();

  const key = `${type}${requestKey || ''}`;

  useEffect(() => {
    if (active) {
      dispatchRequest((action || type)(...variables));
    }
  }, [active, action, type, ...variables]);

  useEffect(() => {
    dispatchRequest(addWatcher(key));

    return () => {
      dispatchRequest(removeWatcher(key));

      if (!store.getState().requests.watchers[key]) {
        dispatchRequest(
          stopSubscriptions([
            {
              requestType: type,
              requestKey,
            },
          ]),
        );
      }
    };
  }, [type, requestKey]);
};

export default useSubscriptions;
