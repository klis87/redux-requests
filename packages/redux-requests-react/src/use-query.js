import { useEffect, useCallback, useMemo, useContext } from 'react';
import { useSelector, useStore } from 'react-redux';
import {
  getQuerySelector,
  resetRequests,
  stopPolling,
  addWatcher,
  removeWatcher,
  joinRequest,
} from '@redux-requests/core';

import useDispatch from './use-dispatch';
import RequestsContext from './requests-context';

const emptyVariables = [];

const useQuery = ({
  variables = emptyVariables,
  autoLoad,
  autoReset,
  throwError,
  suspense,
  suspenseSsr,
  ...selectorProps
}) => {
  const requestContext = useContext(RequestsContext);

  suspenseSsr =
    suspenseSsr === undefined ? requestContext.suspenseSsr : suspenseSsr;
  suspense = suspense === undefined ? requestContext.suspense : suspense;
  autoLoad = autoLoad === undefined ? requestContext.autoLoad : autoLoad;
  autoReset = autoReset === undefined ? requestContext.autoReset : autoReset;
  throwError =
    throwError === undefined ? requestContext.throwError : throwError;

  const dispatch = useDispatch();
  const store = useStore();

  const key = `${selectorProps.type}${selectorProps.requestKey || ''}`;

  const dispatchQuery = useCallback(() => {
    return dispatch(selectorProps.type(...variables));
  }, [selectorProps.type, ...variables]);

  const dispatchStopPolling = useCallback(() => {
    dispatch(
      stopPolling([
        {
          requestType: selectorProps.type,
          requestKey: selectorProps.requestKey,
        },
      ]),
    );
  }, [selectorProps.type, selectorProps.requestKey]);

  useEffect(() => {
    if (autoLoad) {
      dispatchQuery();
    }
  }, [autoLoad, dispatchQuery]);

  const query = useSelector(getQuerySelector(selectorProps));

  useEffect(() => {
    dispatch(addWatcher(key));

    return () => {
      dispatch(removeWatcher(key));

      if (autoReset && !store.getState().requests.watchers[key]) {
        dispatch(
          resetRequests(
            [
              {
                requestType: selectorProps.type,
                requestKey: selectorProps.requestKey,
              },
            ],
            true,
            false,
          ),
        );
      }
    };
  }, [selectorProps.type, selectorProps.requestKey]);

  if (suspenseSsr && (query.loading || query.pristine)) {
    if (autoLoad && query.pristine) {
      throw dispatchQuery();
    }

    throw dispatch(joinRequest(key, autoLoad));
  }

  if (suspense && !suspenseSsr && query.loading) {
    throw dispatch(joinRequest(key));
  }

  if (throwError && query.error) {
    throw {
      error: query.error,
      type: selectorProps.type,
      requestKey: selectorProps.requestKey,
    };
  }

  return useMemo(
    () => ({
      ...query,
      load: dispatchQuery,
      stopPolling: dispatchStopPolling,
    }),
    [query, dispatchQuery, dispatchStopPolling],
  );
};

export default useQuery;
