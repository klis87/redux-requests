import { createStore, combineReducers } from 'redux';
import {
  success,
  error,
  abort,
  Driver,
  clearRequestsCache,
  resetRequests,
  abortRequests,
  ResponseData,
  handleRequests,
  getQuery,
  getQuerySelector,
  getMutation,
  getMutationSelector,
  isRequestAction,
  isRequestActionQuery,
  isResponseAction,
  createQuery,
} from './index';

success('type');
error('type');
abort('type');

const fetchBook = createQuery(
  'fetchBook',
  (id: number) => ({ url: `/books/${id}` }),
  {
    getData: (data: string) => ({
      title: 'title',
      nested: { value: 1, data },
    }),
    normalize: true,
    requestType: 'QUERY',
  },
);

// const fetchBook: (
//   id: string,
// ) => RequestAction<{ id: string; title: string }> = () => {
//   return {
//     type: 'FETCH_BOOK',
//     request: {
//       url: '/book',
//     },
//   };
// };

// const dummyDriver: Driver = ({}, requestAction, {}) =>
//   new Promise<void>(resolve => {
//     resolve();
//   });
const x = fetchBook(1);

const booksQuery = getQuery({}, { type: fetchBook });
booksQuery.data.nested.value;

const booksSelector = getQuerySelector({ type: fetchBook });
booksSelector({}).data.title;

let dummyDriver: Driver;
dummyDriver({}, fetchBook, {})
  .then(v => v)
  .catch(e => {
    throw e;
  });

handleRequests({ driver: dummyDriver });
handleRequests({
  driver: { default: dummyDriver, anotherDriver: dummyDriver },
  onRequest: (request, action) => request,
  onSuccess: async (response, action, store) => {
    const r = await store.dispatch(fetchBook(1));
    return response;
  },
  onError: (error, action) => ({ error }),
  onAbort: action => {},
  takeLatest: true,
  isRequestActionQuery: () => true,
});

const reducer = (state = 0, action) => {
  if (action.type === 'KSKS') {
    return 1;
  }

  return state;
};

const requestsStore = createStore(combineReducers({ x: reducer }));

const ff = fetchBook(1);
const response = requestsStore.dispatch(fetchBook(1));
const response2 = requestsStore.dispatch({ type: 'LALA' });

clearRequestsCache();
clearRequestsCache(['TYPE']);
clearRequestsCache(['TYPE', { requestType: 'ANOTHER_TYPE', requestKey: '1' }]);

abortRequests();
abortRequests(['TYPE']);
abortRequests(['TYPE', { requestType: 'ANOTHER_TYPE', requestKey: '1' }]);

resetRequests();
resetRequests(['TYPE']);
resetRequests(['TYPE', { requestType: 'ANOTHER_TYPE', requestKey: '1' }]);

isRequestAction({ type: 'ACTION' }) === true;
isRequestActionQuery({ type: 'ACTION', request: { url: '/' } }) === true;
isResponseAction({ type: 'ACTION', request: { url: '/' } }) === true;
