import { resetRequests } from '../actions';

import requestsResetReducer from './requests-reset-reducer';

describe('reducers', () => {
  describe('requestsResetReducer', () => {
    it('doesnt do anything for not reset request actions', () => {
      const state = {};
      expect(requestsResetReducer(state, { type: 'NOT_RESET' })).toBe(state);
    });

    it('resets everything for resetRequests action without payload', () => {
      expect(
        requestsResetReducer(
          {
            queries: {
              QUERY: {
                data: 'data',
                pending: 1,
                error: 'error',
                pristine: false,
                normalized: false,
                usedKeys: null,
                dependencies: null,
              },
              QUERY2: {
                data: 'data',
                pending: 1,
                error: 'error',
                pristine: false,
                normalized: true,
                usedKeys: { x: 1 },
                dependencies: [],
              },
            },
            mutations: {
              MUTATION: { error: 'error', pending: 1 },
            },
            cache: { QUERY2: {} },
            downloadProgress: {},
            uploadProgress: {},
          },
          resetRequests(),
        ),
      ).toEqual({
        queries: {
          QUERY: {
            data: null,
            pending: 1,
            error: null,
            pristine: true,
            normalized: false,
            usedKeys: null,
            dependencies: null,
          },
          QUERY2: {
            data: null,
            pending: 1,
            error: null,
            pristine: true,
            normalized: true,
            usedKeys: {},
            dependencies: [],
          },
        },
        mutations: {
          MUTATION: { error: null, pending: 1 },
        },
        cache: {},
        downloadProgress: {},
        uploadProgress: {},
      });
    });

    it('resets specified requests', () => {
      expect(
        requestsResetReducer(
          {
            queries: {
              QUERY: {
                data: 'data',
                pending: 1,
                error: 'error',
                pristine: false,
                normalized: false,
                usedKeys: null,
                dependencies: null,
              },
              QUERY2: {
                data: 'data',
                pending: 1,
                error: 'error',
                pristine: false,
                normalized: true,
                usedKeys: { x: 1 },
                dependencies: [],
              },
              QUERY3: {
                data: 'data',
                pending: 1,
                error: 'error',
                pristine: false,
                normalized: true,
                usedKeys: { x: 1 },
                dependencies: [],
              },
            },
            mutations: {
              MUTATION: { error: 'error', pending: 1 },
              MUTATION2: { error: 'error', pending: 1 },
              MUTATION3: { error: 'error', pending: 1 },
            },
            downloadProgress: {},
            uploadProgress: {},
            cache: { QUERY: {}, QUERY2: {}, QUERY3: {} },
          },
          resetRequests([
            'QUERY',
            { requestType: 'QUERY', requestKey: '2' },
            { requestType: 'MUTATION', requestKey: '2' },
          ]),
        ),
      ).toEqual({
        queries: {
          QUERY: {
            data: null,
            pending: 1,
            error: null,
            pristine: true,
            normalized: false,
            usedKeys: null,
            dependencies: null,
          },
          QUERY2: {
            data: null,
            pending: 1,
            error: null,
            pristine: true,
            normalized: true,
            usedKeys: {},
            dependencies: [],
          },
          QUERY3: {
            data: 'data',
            pending: 1,
            error: 'error',
            pristine: false,
            normalized: true,
            usedKeys: { x: 1 },
            dependencies: [],
          },
        },
        mutations: {
          MUTATION: { error: 'error', pending: 1 },
          MUTATION2: { error: null, pending: 1 },
          MUTATION3: { error: 'error', pending: 1 },
        },
        cache: { QUERY3: {} },
        downloadProgress: {},
        uploadProgress: {},
      });
    });

    it('handles passed requests types as functions', () => {
      const queryAction = () => ({});
      queryAction.toString = () => 'QUERY';

      expect(
        requestsResetReducer(
          {
            queries: {
              QUERY: {
                data: 'data',
                pending: 1,
                error: 'error',
                pristine: false,
                normalized: false,
                usedKeys: null,
                dependencies: null,
              },
            },
            mutations: {},
            cache: {},
            downloadProgress: {},
            uploadProgress: {},
          },
          resetRequests([queryAction]),
        ),
      ).toEqual({
        queries: {
          QUERY: {
            data: null,
            pending: 1,
            error: null,
            pristine: true,
            normalized: false,
            usedKeys: null,
            dependencies: null,
          },
        },
        mutations: {},
        cache: {},
        downloadProgress: {},
        uploadProgress: {},
      });
    });
  });
});
