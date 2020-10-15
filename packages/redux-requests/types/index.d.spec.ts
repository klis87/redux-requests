import {
  success,
  error,
  abort,
  Driver,
  clearRequestsCache,
  resetRequests,
  abortRequests,
  RequestAction,
  ResponseData,
  handleRequests,
  getQuery,
  getQuerySelector,
  getMutation,
  getMutationSelector,
  isRequestAction,
  isRequestActionQuery,
  isResponseAction,
} from './index';

success('type');
error('type');
abort('type');

const requestAction: RequestAction = {
  type: 'FETCH',
  request: { url: '/' },
  meta: {
    driver: 'default',
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
  isRequestActionQuery: () => true,
});

clearRequestsCache();
clearRequestsCache(['TYPE']);
clearRequestsCache(['TYPE', { requestType: 'ANOTHER_TYPE', requestKey: '1' }]);

abortRequests();
abortRequests(['TYPE']);
abortRequests(['TYPE', { requestType: 'ANOTHER_TYPE', requestKey: '1' }]);

resetRequests();
resetRequests(['TYPE']);
resetRequests(['TYPE', { requestType: 'ANOTHER_TYPE', requestKey: '1' }]);

getQuery({}, { type: 'Mutation', requestKey: '1' });

const querySelector = getQuerySelector({ type: 'Query' });
querySelector({});

const query = getQuery<{ key: string }>({}, { type: 'Query' });
query.data.key = '1';

const querySelector2 = getQuerySelector<{ key: string }>({ type: 'Query' });
const query2 = querySelector2({});
query2.data.key = '1';

getMutation({}, { type: 'Mutation', requestKey: '1' });
const mutationSelector = getMutationSelector({ type: 'Mutation' });
mutationSelector({});

isRequestAction({ type: 'ACTION' }) === true;
isRequestActionQuery({ type: 'ACTION', request: { url: '/' } }) === true;
isResponseAction({ type: 'ACTION', request: { url: '/' } }) === true;

const fetchBooks: () => RequestAction<
  { raw: boolean },
  { parsed: boolean }
> = () => {
  return {
    type: 'FETCH_BOOKS',
    request: {
      url: '/books',
    },
    meta: {
      getData: data => ({ parsed: data.raw }),
    },
  };
};

const booksQuery = getQuery({}, { type: fetchBooks });
const { data } = booksQuery;

type BooksData = ResponseData<typeof fetchBooks>;
