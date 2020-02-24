import { getContext } from 'redux-saga/effects';
import { expectSaga } from 'redux-saga-test-plan';

import defaultConfig from '../default-config';
import { REQUESTS_CONFIG } from '../constants';
import sendRequest from './send-request';
import watchRequests, { cancelSendRequestOnAction } from './watch-requests';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const dummyDriver = () => async () => {
  await sleep(0); // necessary to test cancelled tasks in watch requests
  return { data: 'response' };
};

describe('sagas', () => {
  describe('watchRequests', () => {
    const config = { ...defaultConfig, driver: dummyDriver() };
    const action = { type: 'FETCH', request: { url: '/url' } };

    it('forks sendRequests for request action', () => {
      return expectSaga(watchRequests)
        .provide([[getContext(REQUESTS_CONFIG), config]])
        .fork(sendRequest, action)
        .dispatch(action)
        .silentRun(100);
    });

    it('forks sendRequests for batch request action', () => {
      const batchAction = {
        type: 'FETCH',
        request: [{ url: '/' }, { url: '/path' }],
      };

      return expectSaga(watchRequests)
        .provide([[getContext(REQUESTS_CONFIG), config]])
        .fork(sendRequest, batchAction)
        .dispatch(batchAction)
        .silentRun(100);
    });

    it('doesnt fork sendRequests for not request action', () => {
      return expectSaga(watchRequests)
        .provide([[getContext(REQUESTS_CONFIG), config]])
        .not.fork.fn(sendRequest)
        .dispatch({ type: 'NOT_REQUEST' })
        .silentRun(100);
    });

    it('doesnt fork sendRequests for request action with meta runByWatcher as false', () => {
      return expectSaga(watchRequests)
        .provide([[getContext(REQUESTS_CONFIG), config]])
        .not.fork.fn(sendRequest)
        .dispatch({ ...action, meta: { runByWatcher: false } })
        .silentRun(100);
    });

    it('forks cancelSendRequestOnAction on abort action', () => {
      return expectSaga(watchRequests, { ...defaultConfig, abortOn: 'ABORT' })
        .provide([[getContext(REQUESTS_CONFIG), config]])
        .fork.fn(cancelSendRequestOnAction)
        .dispatch(action)
        .silentRun(100);
    });

    it('cancels request on abort action', () => {
      return expectSaga(watchRequests, { ...defaultConfig, abortOn: 'ABORT' })
        .provide([[getContext(REQUESTS_CONFIG), config]])
        .put.actionType('FETCH_ABORT')
        .dispatch(action)
        .dispatch({ type: 'ABORT' })
        .silentRun(100);
    });

    it('cancels request on abort action defined in action meta', () => {
      return expectSaga(watchRequests)
        .provide([[getContext(REQUESTS_CONFIG), config]])
        .put.actionType('FETCH_ABORT')
        .dispatch({ ...action, meta: { abortOn: 'ABORT' } })
        .dispatch({ type: 'ABORT' })
        .silentRun(100);
    });

    it('doesnt cancel request without abort action', () => {
      return expectSaga(watchRequests, { ...defaultConfig, abortOn: 'ABORT' })
        .provide([[getContext(REQUESTS_CONFIG), config]])
        .not.put.actionType('FETCH_ABORT')
        .dispatch(action)
        .dispatch({ type: 'ACTION' })
        .silentRun(100);
    });

    it('uses takeLatest for get requests', () => {
      return expectSaga(watchRequests)
        .provide([[getContext(REQUESTS_CONFIG), config]])
        .put.actionType('FETCH_ABORT')
        .dispatch(action)
        .dispatch(action)
        .silentRun(100);
    });

    it('uses takeLatest for queries', () => {
      const postAction = {
        type: 'FETCH',
        request: {
          query: `
            {
              x
            }
          `,
        },
      };

      return expectSaga(watchRequests)
        .provide([[getContext(REQUESTS_CONFIG), config]])
        .put.actionType('FETCH_ABORT')
        .dispatch(postAction)
        .dispatch(postAction)
        .silentRun(100);
    });

    it('uses takeEvery for post requests', () => {
      const postAction = {
        type: 'FETCH',
        request: { url: '/url', method: 'post' },
      };

      return expectSaga(watchRequests)
        .provide([[getContext(REQUESTS_CONFIG), config]])
        .not.put.actionType('FETCH_ABORT')
        .dispatch(postAction)
        .dispatch(postAction)
        .silentRun(100);
    });

    it('uses takeEvery for mutations', () => {
      const postAction = {
        type: 'FETCH',
        request: {
          query: `
            mutation($id: ID!) {
              x(id: $id) {
                y
              }
            }
          `,
        },
      };

      return expectSaga(watchRequests)
        .provide([[getContext(REQUESTS_CONFIG), config]])
        .not.put.actionType('FETCH_ABORT')
        .dispatch(postAction)
        .dispatch(postAction)
        .silentRun(100);
    });

    it('allows override takeLatest config', () => {
      return expectSaga(watchRequests, { ...defaultConfig, takeLatest: false })
        .provide([[getContext(REQUESTS_CONFIG), config]])
        .not.put.actionType('FETCH_ABORT')
        .dispatch(action)
        .dispatch(action)
        .silentRun(100);
    });

    it('allows overriding takeLatest per action', () => {
      const actionWithMeta = {
        ...action,
        meta: { takeLatest: false },
      };

      return expectSaga(watchRequests, { ...defaultConfig, takeLatest: true })
        .provide([[getContext(REQUESTS_CONFIG), config]])
        .not.put.actionType('FETCH_ABORT')
        .dispatch(actionWithMeta)
        .dispatch(actionWithMeta)
        .silentRun(100);
    });

    it('respects meta requestKet to distinguish actions of the same type', () => {
      return expectSaga(watchRequests)
        .provide([[getContext(REQUESTS_CONFIG), config]])
        .not.put.actionType('FETCH_ABORT')
        .dispatch({
          type: 'FETCH',
          request: { url: '/url' },
          meta: { requestKey: '1' },
        })
        .dispatch({
          type: 'FETCH',
          request: { url: '/url' },
          meta: { requestKey: '2' },
        })
        .silentRun(100);
    });
  });
});
