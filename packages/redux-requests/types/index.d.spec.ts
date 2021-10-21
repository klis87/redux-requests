import { createStore, combineReducers } from 'redux';
import {
  success,
  error,
  abort,
  Driver,
  clearRequestsCache,
  resetRequests,
  abortRequests,
  RequestAction,
  LocalMutationAction,
  ResponseData,
  handleRequests,
  getQuery,
  getQuerySelector,
  getMutation,
  getMutationSelector,
  isRequestAction,
  isRequestActionQuery,
  isResponseAction,
  createRequestsStore,
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

const accessRequestActionProps = (requestAction: RequestAction) => {
  if (requestAction.request !== undefined) {
    // this request action has an existing `request` key
  } else if (requestAction.payload !== undefined) {
    // this request action has an existing `payload` key
  }
}

const fetchBook: (
  id: string,
) => RequestAction<{ id: string; title: string }> = () => {
  return {
    type: 'FETCH_BOOK',
    request: {
      url: '/book',
    },
  };
};

const dummyDriver: Driver = ({}, requestAction, {}) =>
  new Promise<void>((resolve) => { resolve() });

handleRequests({ driver: dummyDriver });
handleRequests({
  driver: { default: dummyDriver, anotherDriver: dummyDriver },
  onRequest: (request, action) => request,
  onSuccess: async (response, action, store) => {
    const r = await store.dispatchRequest(fetchBook('1'));
    return response;
  },
  onError: (error, action) => ({ error }),
  onAbort: action => {},
  takeLatest: true,
  isRequestActionQuery: () => true,
});

const requestsStore = createRequestsStore(createStore(combineReducers({})));
const response = requestsStore.dispatchRequest(fetchBook('1'));

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

const booksSelector = getQuerySelector({ type: fetchBooks });
booksSelector({}).data.parsed;

type BooksData = ResponseData<typeof fetchBooks>;

const localMutation: () => LocalMutationAction = () => ({
  type: 'LOCAL_MUTATION',
  meta: {
    localData: { id: '1', title: 'title' },
    mutations: {
      FETCH_BOOKS: {
        updateData: (data: BooksData) => ({ parsed: data.parsed }),
        local: true,
      },
    },
  },
});
