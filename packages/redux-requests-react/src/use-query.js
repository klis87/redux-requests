import { useEffect, useCallback, useMemo, useContext } from 'react';
import { useSelector, useStore } from 'react-redux';
import {
  getQuerySelector,
  resetRequests,
  addWatcher,
  removeWatcher,
  joinRequest,
} from '@redux-requests/core';

import useDispatchRequest from './use-dispatch-request';
import RequestsContext from './requests-context';

const emptyVariables = [];

const useQuery = ({
  variables = emptyVariables,
  autoLoad,
  autoReset,
  throwError,
  suspense,
  ...selectorProps
}) => {
  const requestContext = useContext(RequestsContext);

  const { suspenseSsr } = requestContext;
  suspense = suspense === undefined ? requestContext.suspense : suspense;
  autoLoad = autoLoad === undefined ? requestContext.autoLoad : autoLoad;
  autoReset = autoReset === undefined ? requestContext.autoReset : autoReset;
  throwError =
    throwError === undefined ? requestContext.throwError : throwError;

  const dispatchRequest = useDispatchRequest();
  const store = useStore();

  const key = `${selectorProps.type}${selectorProps.requestKey || ''}`;

  const dispatchQuery = useCallback(() => {
    if (autoLoad) {
      return dispatchRequest(
        (selectorProps.action || selectorProps.type)(...variables),
      );
    }

    return Promise.resolve(null);
  }, [autoLoad, selectorProps.action, selectorProps.type, ...variables]);

  useEffect(() => {
    if (autoLoad) {
      dispatchQuery();
    }
  }, [autoLoad, dispatchQuery]);

  const query = useSelector(getQuerySelector(selectorProps));

  useEffect(() => {
    dispatchRequest(addWatcher(key));

    return () => {
      dispatchRequest(removeWatcher(key));

      if (autoReset && !store.getState().requests.watchers[key]) {
        dispatchRequest(
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

    throw dispatchRequest(joinRequest(key, autoLoad));
  }

  if (suspense && !suspenseSsr && query.loading) {
    throw dispatchRequest(joinRequest(key));
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
    }),
    [query, dispatchQuery],
  );
};

export default useQuery;
