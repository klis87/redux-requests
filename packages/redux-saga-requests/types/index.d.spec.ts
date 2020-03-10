import {
  success,
  error,
  abort,
  Driver,
  sendRequest,
  clearRequestsCache,
  RequestAction,
  handleRequests,
  getQuery,
  getQuerySelector,
  getMutation,
  getMutationSelector,
} from './index';

success('type');
error('type');
abort('type');

const requestAction: RequestAction = {
  type: 'FETCH',
  request: { url: '/' },
  meta: {
    driver: 'default',
    asPromise: true,
    runByWatcher: false,
    abortOn: ['ABORT'],
    takeLatest: false,
    cache: 1,
    cacheKey: 'key',
    cacheSize: 2,
    dependentRequestsNumber: 1,
    isDependentRequest: true,
    customKey: 'customValue',
    requestKey: '1',
    asMutation: true,
    mutations: {
      FETCH: {
        updateData: () => 'data',
        revertData: () => 'data',
      },
    },
  },
};

let dummyDriver: Driver;
dummyDriver({}, requestAction)
  .then(v => v)
  .catch(e => {
    throw e;
  });

handleRequests({ driver: dummyDriver });
handleRequests({
  driver: { default: dummyDriver, anotherDriver: dummyDriver },
  onRequest: (request, action) => request,
  onSuccess: (response, action) => response,
  onError: (error, action) => ({ error }),
  onAbort: action => {},
  takeLatest: true,
  abortOn: 'TYPE',
  isRequestActionQuery: () => true,
});

sendRequest(requestAction);
sendRequest({ type: 'type', payload: { request: {} } });
sendRequest({ type: 'type', payload: { request: [{}] } });
sendRequest(
  { type: 'type', request: [{}, {}] },
  {
    dispatchRequestAction: true,
    silent: false,
    runOnRequest: false,
    runOnSuccess: false,
    runOnError: false,
    runOnAbort: false,
  },
);

clearRequestsCache();
clearRequestsCache('TYPE');
clearRequestsCache('TYPE', 'ANOTHER_TYPE');

getQuery({}, { type: 'Mutation', requestKey: '1' });

const querySelector = getQuerySelector({ type: 'Query' });
querySelector({}, { type: 'Query' });

const query = getQuery<{ key: string }>({}, { type: 'Query' });
query.data.key = '1';

const querySelector2 = getQuerySelector<{ key: string }>({ type: 'Query' });
const query2 = querySelector2({}, { type: 'Query' });
query2.data.key = '1';

getMutation({}, { type: 'Mutation', requestKey: '1' });
const mutationSelector = getMutationSelector({ type: 'Mutation' });
mutationSelector({}, { type: 'Mutation' });
