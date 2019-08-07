import { success, error, abort, createErrorAction } from '../actions';
import { requestsReducer } from '.';

describe('reducers', () => {
  describe('requestsReducer', () => {
    const actionType = 'ACTION';

    describe('simple', () => {
      const defaultState = {
        data: null,
        error: null,
        pending: 0,
        mutations: null,
      };
      const reducer = requestsReducer({ actionType });

      it('returns correct default state', () => {
        expect(reducer(undefined, {})).toEqual(defaultState);
      });

      it('returns correct state for not handled action', () => {
        const state = 'some_state';
        expect(reducer(state, {})).toBe(state);
      });

      it('returns correct state for request action', () => {
        expect(reducer(defaultState, { type: actionType })).toEqual({
          data: null,
          error: null,
          pending: 1,
          mutations: null,
        });
      });

      it('returns correct state for success action', () => {
        const data = 'data';
        const action = {
          type: success(actionType),
          data,
        };
        expect(reducer(defaultState, action)).toEqual({
          data,
          error: null,
          pending: -1,
          mutations: null,
        });
      });

      it('returns correct state for error action', () => {
        const someError = 'error';
        const action = {
          type: error(actionType),
          error: someError,
        };
        expect(reducer(defaultState, action)).toEqual({
          data: null,
          error: someError,
          pending: -1,
          mutations: null,
        });
      });

      it('returns correct state for abort action', () => {
        const action = { type: abort(actionType) };
        expect(reducer(defaultState, action)).toEqual({
          data: null,
          error: null,
          pending: -1,
          mutations: null,
        });
      });

      it('supports action creator libraries', () => {
        const action = () => ({ type: actionType });
        action.toString = () => actionType;
        const reduxActReducer = requestsReducer({ actionType: action });
        expect(reduxActReducer(defaultState, action())).toEqual({
          data: null,
          error: null,
          pending: 1,
          mutations: null,
        });
      });
    });

    describe('with adjusted getDefaultData', () => {
      it('sets corrent initial state when multiple true', () => {
        const reducer = requestsReducer({
          actionType,
          getDefaultData: multiple => (multiple ? ['default'] : 'default'),
          multiple: true,
        });
        expect(reducer(undefined, { type: actionType })).toEqual({
          data: ['default'],
          error: null,
          pending: 1,
          mutations: null,
        });
      });

      it('sets correct initial state when multiple false', () => {
        const reducer = requestsReducer({
          actionType,
          getDefaultData: multiple => (multiple ? ['default'] : 'default'),
          multiple: false,
        });
        expect(reducer(undefined, { type: actionType })).toEqual({
          data: 'default',
          error: null,
          pending: 1,
          mutations: null,
        });
      });

      it('resets state to proper default on error', () => {
        const reducer = requestsReducer({
          actionType,
          getDefaultData: multiple => (multiple ? ['default'] : 'default'),
          multiple: true,
        });
        expect(
          reducer(
            {
              data: {},
              error: null,
              pending: 1,
              mutations: null,
            },
            createErrorAction({ type: actionType }, 'error'),
          ),
        ).toEqual({
          data: ['default'],
          error: 'error',
          pending: 0,
          mutations: null,
        });
      });
    });

    describe('with config override', () => {
      const RESET = 'RESET';
      const reducer = requestsReducer({
        actionType,
        multiple: true,
        getData: (state, action) => ({ nested: action.payload.data }),
        onRequest: (state, action, { multiple }) => ({
          ...state,
          data: multiple ? [] : null,
          pending: state.pending + 2,
          error: null,
          multiple,
        }),
        onSuccess: (state, action, { multiple, getData }) => ({
          ...state,
          data: getData(state, action),
          pending: state.pending - 2,
          error: null,
          multiple,
        }),
        onError: (state, action, { multiple }) => ({
          ...state,
          data: multiple ? [] : null,
          pending: state.pending - 2,
          error: action.payload,
          multiple,
        }),
        onAbort: (state, action, { multiple }) => ({
          ...state,
          pending: state.pending - 2,
          multiple,
        }),
        resetOn: action => action.type === RESET,
      });
      const initialState = reducer(undefined, {});

      it('returns correct default state', () => {
        expect(reducer(undefined, {})).toEqual({
          data: [],
          error: null,
          pending: 0,
          mutations: null,
        });
      });

      it('returns correct state for request action', () => {
        expect(reducer(initialState, { type: actionType })).toEqual({
          data: [],
          error: null,
          pending: 2,
          mutations: null,
          multiple: true,
        });
      });

      it('returns correct state for success action', () => {
        const data = ['data'];
        const action = {
          type: success(actionType),
          payload: { data },
        };
        expect(reducer(initialState, action)).toEqual({
          data: { nested: data },
          error: null,
          pending: -2,
          mutations: null,
          multiple: true,
        });
      });

      it('returns correct state for error action', () => {
        const someError = 'error';
        const action = {
          type: error(actionType),
          payload: someError,
        };
        expect(reducer(initialState, action)).toEqual({
          data: [],
          error: someError,
          pending: -2,
          mutations: null,
          multiple: true,
        });
      });

      it('returns correct state for abort action', () => {
        const action = { type: abort(actionType) };
        expect(reducer(initialState, action)).toEqual({
          data: [],
          error: null,
          pending: -2,
          mutations: null,
          multiple: true,
        });
      });

      it('handles reset action when resetOn is function', () => {
        let nextState = reducer(initialState, { type: actionType });
        nextState = reducer(nextState, { type: actionType });
        expect(reducer(nextState, { type: 'RESET' })).toEqual({
          data: [],
          error: null,
          pending: 4,
          mutations: null,
        });
      });

      it('handles reset action when resetOn is the same as the reducer actionType', () => {
        const resetRequestReducer = requestsReducer({
          actionType,
          resetOn: [actionType],
          multiple: true,
        });

        const state = {
          data: [1, 2, 3],
          mutations: null,
          error: null,
          pending: 0,
        };
        expect(resetRequestReducer(state, { type: actionType })).toEqual({
          data: [],
          error: null,
          pending: 1,
          mutations: null,
        });
      });
    });

    describe('with mutations', () => {
      const MUTATION_ACTION = 'MUTATION_ACTION';
      const commonReducer = requestsReducer({
        actionType,
        mutations: {
          [MUTATION_ACTION]: true,
        },
      });
      const defaultState = {
        data: null,
        error: null,
        pending: 0,
        mutations: {
          [MUTATION_ACTION]: {
            error: null,
            pending: 0,
          },
        },
      };

      it('returns default state containing mutation default data', () => {
        expect(commonReducer(undefined, {})).toEqual(defaultState);
      });

      it('returns default state containing mutation default data with defined requestKey', () => {
        const reducer = requestsReducer({
          actionType,
          mutations: {
            [MUTATION_ACTION]: {
              updateData: (state, action) => action.data,
              getRequestKey: action => action.meta.id,
            },
          },
        });
        expect(reducer(undefined, {})).toEqual({
          ...defaultState,
          mutations: {
            [MUTATION_ACTION]: {},
          },
        });
      });

      it('increases pending counter on mutation request', () => {
        expect(commonReducer(defaultState, { type: MUTATION_ACTION })).toEqual({
          data: null,
          error: null,
          pending: 0,
          mutations: {
            [MUTATION_ACTION]: {
              error: null,
              pending: 1,
            },
          },
        });
      });

      it('can update data optimistic', () => {
        const reducer = requestsReducer({
          actionType,
          mutations: {
            [MUTATION_ACTION]: {
              updateDataOptimistic: (state, action) => action.data,
            },
          },
        });

        expect(
          reducer(defaultState, { type: MUTATION_ACTION, data: 'data' }),
        ).toEqual({
          data: 'data',
          error: null,
          pending: 0,
          mutations: {
            [MUTATION_ACTION]: {
              error: null,
              pending: 1,
            },
          },
        });
      });

      it('increases pending counter on mutation request with defined requestKey', () => {
        const reducer = requestsReducer({
          actionType,
          mutations: {
            [MUTATION_ACTION]: {
              updateData: true,
              getRequestKey: action => action.meta.id,
            },
          },
        });
        const initialState = reducer(undefined, {});

        let nextState = reducer(initialState, {
          type: MUTATION_ACTION,
          request: { url: '/' },
          meta: { id: 'a' },
        });
        expect(nextState).toEqual({
          data: null,
          error: null,
          pending: 0,
          mutations: {
            [MUTATION_ACTION]: {
              a: {
                error: null,
                pending: 1,
              },
            },
          },
        });

        nextState = reducer(nextState, {
          type: MUTATION_ACTION,
          request: { url: '/' },
          meta: { id: 'b' },
        });
        expect(nextState).toEqual({
          data: null,
          error: null,
          pending: 0,
          mutations: {
            [MUTATION_ACTION]: {
              a: {
                error: null,
                pending: 1,
              },
              b: {
                error: null,
                pending: 1,
              },
            },
          },
        });

        nextState = reducer(nextState, {
          type: MUTATION_ACTION,
          request: { url: '/' },
          meta: { id: 'a' },
        });
        expect(nextState).toEqual({
          data: null,
          error: null,
          pending: 0,
          mutations: {
            [MUTATION_ACTION]: {
              a: {
                error: null,
                pending: 2,
              },
              b: {
                error: null,
                pending: 1,
              },
            },
          },
        });
      });

      it('handles mutation success response', () => {
        expect(
          commonReducer(defaultState, {
            type: success(MUTATION_ACTION),
            data: 'response',
            meta: { requestAction: { type: MUTATION_ACTION } },
          }),
        ).toEqual({
          data: 'response',
          error: null,
          pending: 0,
          mutations: {
            [MUTATION_ACTION]: {
              error: null,
              pending: -1,
            },
          },
        });
      });

      it('handles mutation success response defined as updateData true', () => {
        const reducer = requestsReducer({
          actionType,
          mutations: {
            [MUTATION_ACTION]: { updateData: true },
          },
        });
        expect(
          reducer(defaultState, {
            type: success(MUTATION_ACTION),
            data: 'response',
            meta: { requestAction: { type: MUTATION_ACTION } },
          }),
        ).toEqual({
          data: 'response',
          error: null,
          pending: 0,
          mutations: {
            [MUTATION_ACTION]: {
              error: null,
              pending: -1,
            },
          },
        });
      });

      it('doesnt override data when a defined mutation is false', () => {
        const reducer = requestsReducer({
          actionType,
          mutations: {
            [MUTATION_ACTION]: false,
          },
        });

        expect(
          reducer(defaultState, {
            type: success(MUTATION_ACTION),
            data: 'response',
            meta: { requestAction: { type: MUTATION_ACTION } },
          }),
        ).toEqual({
          data: null,
          error: null,
          pending: 0,
          mutations: {
            [MUTATION_ACTION]: {
              error: null,
              pending: -1,
            },
          },
        });
      });

      it('doesnt override data when a defined mutation is object with key updateData as false', () => {
        const reducer = requestsReducer({
          actionType,
          mutations: {
            [MUTATION_ACTION]: { updateData: false },
          },
        });

        expect(
          reducer(defaultState, {
            type: success(MUTATION_ACTION),
            data: 'response',
            meta: { requestAction: { type: MUTATION_ACTION } },
          }),
        ).toEqual({
          data: null,
          error: null,
          pending: 0,
          mutations: {
            [MUTATION_ACTION]: {
              error: null,
              pending: -1,
            },
          },
        });
      });

      it('uses updateData not getData when defined', () => {
        const reducer = requestsReducer({
          actionType,
          getData: () => null,
          updateData: (state, action) => action.data,
          mutations: {
            [MUTATION_ACTION]: true,
          },
        });

        expect(
          reducer(defaultState, {
            type: success(MUTATION_ACTION),
            data: 'response',
            meta: { requestAction: { type: MUTATION_ACTION } },
          }),
        ).toEqual({
          data: 'response',
          error: null,
          pending: 0,
          mutations: {
            [MUTATION_ACTION]: {
              error: null,
              pending: -1,
            },
          },
        });
      });

      it('handles updateData customized per mutation', () => {
        const reducer = requestsReducer({
          actionType,
          getData: () => null,
          updateData: (state, action) => action.data,
          mutations: {
            [MUTATION_ACTION]: (state, action) => action.data.nested,
          },
        });

        expect(
          reducer(defaultState, {
            type: success(MUTATION_ACTION),
            data: { nested: 'response' },
            meta: { requestAction: { type: MUTATION_ACTION } },
          }),
        ).toEqual({
          data: 'response',
          error: null,
          pending: 0,
          mutations: {
            [MUTATION_ACTION]: {
              error: null,
              pending: -1,
            },
          },
        });
      });

      it('handles updateData customized per mutation defined in updateData object key', () => {
        const reducer = requestsReducer({
          actionType,
          getData: () => null,
          updateData: (state, action) => action.data,
          mutations: {
            [MUTATION_ACTION]: {
              updateData: (state, action) => action.data.nested,
            },
          },
        });

        expect(
          reducer(defaultState, {
            type: success(MUTATION_ACTION),
            data: { nested: 'response' },
            meta: { requestAction: { type: MUTATION_ACTION } },
          }),
        ).toEqual({
          data: 'response',
          error: null,
          pending: 0,
          mutations: {
            [MUTATION_ACTION]: {
              error: null,
              pending: -1,
            },
          },
        });
      });

      it('handles updateData customized per mutation with defined requestKey', () => {
        const reducer = requestsReducer({
          actionType,
          getData: () => null,
          updateData: (state, action) => action.data,
          mutations: {
            [MUTATION_ACTION]: {
              updateData: (state, action) => action.data.nested,
              getRequestKey: action => action.meta.id,
            },
          },
        });

        let state = {
          data: null,
          error: null,
          pending: 0,
          mutations: {
            [MUTATION_ACTION]: {
              1: {
                error: null,
                pending: 2,
              },
              2: {
                error: null,
                pending: 1,
              },
            },
          },
        };

        state = reducer(state, {
          type: success(MUTATION_ACTION),
          data: { nested: 'response' },
          meta: {
            requestAction: { type: MUTATION_ACTION, meta: { id: '1' } },
            id: '1',
          },
        });

        expect(state).toEqual({
          data: 'response',
          error: null,
          pending: 0,
          mutations: {
            [MUTATION_ACTION]: {
              1: {
                error: null,
                pending: 1,
              },
              2: {
                error: null,
                pending: 1,
              },
            },
          },
        });

        state = reducer(state, {
          type: success(MUTATION_ACTION),
          data: { nested: 'response2' },
          meta: {
            requestAction: { type: MUTATION_ACTION, meta: { id: '1' } },
            id: '1',
          },
        });

        expect(state).toEqual({
          data: 'response2',
          error: null,
          pending: 0,
          mutations: {
            [MUTATION_ACTION]: {
              2: {
                error: null,
                pending: 1,
              },
            },
          },
        });

        state = reducer(state, {
          type: success(MUTATION_ACTION),
          data: { nested: 'response2' },
          meta: {
            requestAction: { type: MUTATION_ACTION, meta: { id: '2' } },
            id: '2',
          },
        });

        expect(state).toEqual({
          data: 'response2',
          error: null,
          pending: 0,
          mutations: {
            [MUTATION_ACTION]: {},
          },
        });
      });

      it('handles mutation error response', () => {
        expect(
          commonReducer(defaultState, {
            type: error(MUTATION_ACTION),
            error: 'error',
            meta: { requestAction: { type: MUTATION_ACTION } },
          }),
        ).toEqual({
          data: null,
          error: null,
          pending: 0,
          mutations: {
            [MUTATION_ACTION]: {
              error: 'error',
              pending: -1,
            },
          },
        });
      });

      it('reverts optimistic update on mutation error', () => {
        const reducer = requestsReducer({
          actionType,
          mutations: {
            [MUTATION_ACTION]: {
              updateDataOptimistic: (state, action) => action.data,
              revertData: (state, action) => action.meta.requestAction.oldData,
            },
          },
        });

        expect(
          reducer(defaultState, {
            type: error(MUTATION_ACTION),
            error: 'error',
            meta: {
              requestAction: { type: MUTATION_ACTION, oldData: 'oldData' },
            },
          }),
        ).toEqual({
          data: 'oldData',
          error: null,
          pending: 0,
          mutations: {
            [MUTATION_ACTION]: {
              error: 'error',
              pending: -1,
            },
          },
        });
      });

      it('handles mutation error response with defined requestKey', () => {
        const reducer = requestsReducer({
          actionType,
          mutations: {
            [MUTATION_ACTION]: {
              updateData: true,
              getRequestKey: action => action.meta.id,
            },
          },
        });

        let state = {
          data: null,
          error: null,
          pending: 0,
          mutations: {
            [MUTATION_ACTION]: {
              1: {
                error: null,
                pending: 2,
              },
            },
          },
        };

        state = reducer(state, {
          type: error(MUTATION_ACTION),
          error: 'error',
          meta: {
            requestAction: { type: MUTATION_ACTION, meta: { id: '1' } },
          },
        });

        expect(state).toEqual({
          data: null,
          error: null,
          pending: 0,
          mutations: {
            [MUTATION_ACTION]: {
              1: {
                error: 'error',
                pending: 1,
              },
            },
          },
        });

        state = reducer(state, {
          type: error(MUTATION_ACTION),
          error: 'error2',
          meta: {
            requestAction: { type: MUTATION_ACTION, meta: { id: '1' } },
          },
        });

        expect(state).toEqual({
          data: null,
          error: null,
          pending: 0,
          mutations: {
            [MUTATION_ACTION]: {
              1: {
                error: 'error2',
                pending: 0,
              },
            },
          },
        });
      });

      it('handles mutation abort response', () => {
        expect(
          commonReducer(defaultState, {
            type: abort(MUTATION_ACTION),
            meta: { requestAction: { type: MUTATION_ACTION } },
          }),
        ).toEqual({
          data: null,
          error: null,
          pending: 0,
          mutations: {
            [MUTATION_ACTION]: {
              error: null,
              pending: -1,
            },
          },
        });
      });

      it('reverts optimistic update on mutation abort', () => {
        const reducer = requestsReducer({
          actionType,
          mutations: {
            [MUTATION_ACTION]: {
              updateDataOptimistic: (state, action) => action.data,
              revertData: (state, action) => action.meta.requestAction.oldData,
            },
          },
        });

        expect(
          reducer(defaultState, {
            type: abort(MUTATION_ACTION),
            meta: {
              requestAction: { type: MUTATION_ACTION, oldData: 'oldData' },
            },
          }),
        ).toEqual({
          data: 'oldData',
          error: null,
          pending: 0,
          mutations: {
            [MUTATION_ACTION]: {
              error: null,
              pending: -1,
            },
          },
        });
      });

      it('handles mutation abort response with defined requestKey', () => {
        const reducer = requestsReducer({
          actionType,
          mutations: {
            [MUTATION_ACTION]: {
              updateData: true,
              getRequestKey: action => action.meta.id,
            },
          },
        });

        let state = {
          data: null,
          error: null,
          pending: 0,
          mutations: {
            [MUTATION_ACTION]: {
              1: {
                error: null,
                pending: 2,
              },
            },
          },
        };

        state = reducer(state, {
          type: abort(MUTATION_ACTION),
          meta: {
            requestAction: { type: MUTATION_ACTION, meta: { id: '1' } },
          },
        });

        expect(state).toEqual({
          data: null,
          error: null,
          pending: 0,
          mutations: {
            [MUTATION_ACTION]: {
              1: {
                error: null,
                pending: 1,
              },
            },
          },
        });

        state = reducer(state, {
          type: abort(MUTATION_ACTION),
          meta: {
            requestAction: { type: MUTATION_ACTION, meta: { id: '1' } },
          },
        });

        expect(state).toEqual({
          data: null,
          error: null,
          pending: 0,
          mutations: {
            [MUTATION_ACTION]: {},
          },
        });
      });
    });

    describe('with local mutations', () => {
      const LOCAL_MUTATION_ACTION = 'LOCAL_MUTATION_ACTION';
      const commonReducer = requestsReducer({
        actionType,
        mutations: {
          mutation: true,
          [LOCAL_MUTATION_ACTION]: {
            local: true,
            updateData: (state, action) => action.data,
          },
        },
      });
      const defaultState = {
        data: null,
        error: null,
        pending: 0,
        mutations: {
          mutation: {
            error: null,
            pending: 0,
          },
        },
      };

      it('does not contain local mutation in initial state ', () => {
        expect(commonReducer(undefined, {})).toEqual(defaultState);
      });

      it('updates data for local mutation and doesnt keep local mutation state', () => {
        expect(
          commonReducer(defaultState, {
            type: LOCAL_MUTATION_ACTION,
            data: 'data',
          }),
        ).toEqual({ ...defaultState, data: 'data' });
      });
    });
  });
});
