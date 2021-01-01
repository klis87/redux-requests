import configureStore from 'redux-mock-store';

import { createClientSsrMiddleware } from '.';

describe('middleware', () => {
  describe('createClientSsrMiddleware', () => {
    it('doesnt do anything for non request actions', () => {
      const mockStore = configureStore([createClientSsrMiddleware()]);
      const store = mockStore({});
      const action = { type: 'ACTION' };
      expect(store.dispatch(action)).toBe(action);
      expect(store.getActions()).toEqual([action]);
    });

    it('adds meta.ssrResponse to request action if request in ssr state', () => {
      const mockStore = configureStore([createClientSsrMiddleware()]);
      const store = mockStore({
        requests: {
          queries: {
            REQUEST: {
              data: 'data',
              pending: 0,
              ref: {},
            },
          },
          downloadProgress: {},
          uploadProgress: {},
          ssr: ['REQUEST'],
        },
      });
      const action = { type: 'REQUEST', request: { url: '/' } };
      const actionWithSsrResponse = {
        ...action,
        meta: { ssrResponse: { data: 'data' } },
      };
      expect(store.dispatch(action)).toEqual(actionWithSsrResponse);
      expect(store.getActions()).toEqual([actionWithSsrResponse]);
    });

    it('doesnt do anything to request action if request not in ssr state', () => {
      const mockStore = configureStore([createClientSsrMiddleware()]);
      const store = mockStore({
        requests: {
          queries: {
            REQUEST: {
              data: 'data',
              pending: 0,
              ref: {},
            },
          },
          downloadProgress: {},
          uploadProgress: {},
          ssr: ['REQUEST'],
        },
      });
      const action = { type: 'REQUEST2', request: { url: '/' } };
      expect(store.dispatch(action)).toEqual(action);
      expect(store.getActions()).toEqual([action]);
    });

    it('adds meta.ssrResponse to request action with requestKey if request in ssr state', () => {
      const mockStore = configureStore([createClientSsrMiddleware()]);
      const store = mockStore({
        requests: {
          queries: {
            REQUEST1: {
              data: 'data',
              pending: 0,
              ref: {},
            },
          },
          downloadProgress: {},
          uploadProgress: {},
          ssr: ['REQUEST1'],
        },
      });
      const action = {
        type: 'REQUEST',
        request: { url: '/' },
        meta: { requestKey: '1' },
      };
      const actionWithSsrResponse = {
        ...action,
        meta: { ...action.meta, ssrResponse: { data: 'data' } },
      };
      expect(store.dispatch(action)).toEqual(actionWithSsrResponse);
      expect(store.getActions()).toEqual([actionWithSsrResponse]);
    });
  });
});
