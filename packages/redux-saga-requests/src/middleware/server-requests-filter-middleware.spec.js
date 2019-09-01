import configureStore from 'redux-mock-store';

import { serverRequestsFilterMiddleware } from '.';

describe('middleware', () => {
  describe('serverRequestsFilterMiddleware', () => {
    it('doesnt dispatch request already dispatched on server', () => {
      const serverRequest = {
        type: 'SERVER_REQUEST',
        request: { url: '/' },
      };
      const clientRequest = {
        type: 'CLIENT_REQUEST',
        request: { url: '/' },
      };
      const nonRequestAction = { type: 'NOT_REQUEST' };
      const mockStore = configureStore([
        serverRequestsFilterMiddleware({
          serverRequestActions: [serverRequest],
        }),
      ]);
      const store = mockStore({});
      expect(store.dispatch(serverRequest)).toEqual(null);
      expect(store.dispatch(serverRequest)).toEqual(serverRequest);
      expect(store.dispatch(clientRequest)).toEqual(clientRequest);
      expect(store.dispatch(nonRequestAction)).toEqual(nonRequestAction);
      expect(store.getActions()).toEqual([
        serverRequest,
        clientRequest,
        nonRequestAction,
      ]);
    });
  });
});
