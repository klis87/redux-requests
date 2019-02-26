import { success, error, abort } from './actions';
import { requestsReducer } from './reducers';

const actionType = 'ACTION';

describe('reducers', () => {
  describe('requestsReducer', () => {
    describe('without passed reducer', () => {
      const defaultState = {
        data: null,
        error: null,
        pending: 0,
        operations: null,
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
          operations: null,
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
          operations: null,
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
          operations: null,
        });
      });

      it('returns correct state for abort action', () => {
        const action = { type: abort(actionType) };
        expect(reducer(defaultState, action)).toEqual({
          data: null,
          error: null,
          pending: -1,
          operations: null,
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
          operations: null,
        });
      });
    });

    describe('providing the default value of the reducer', () => {
      const emptyFeatureCollection = { type: 'FeatureCollection', features: [] };
      const defaultProvider = jest.fn(() => (emptyFeatureCollection));
      const reducer = requestsReducer({ actionType, getDefault: defaultProvider });

      afterEach(() => {
        defaultProvider.mockClear();
      });

      it('sets initial state via getDefault', () => {
        expect(reducer(undefined, {})).toEqual({
          data: emptyFeatureCollection,
          error: null,
          pending: 0,
          operations: null,
        });
        expect(defaultProvider.mock.calls.length).toBe(1);
      });

      it('resets data via getDefault on errors', () => {
        const someError = 'asdasda';
        const action = { type: error(actionType), error: someError };
        expect(reducer({
          data: {},
          error: someError,
          pending: 1,
          operations: null,
        }, action)).toEqual({
          data: emptyFeatureCollection,
          error: someError,
          pending: 0,
          operations: null,
        });
        expect(defaultProvider.mock.calls.length).toBe(1);
      });
    });

    describe('without passed reducer with local config override', () => {
      const RESET = 'RESET';
      const reducer = requestsReducer({
        actionType,
        multiple: true,
        getData: (state, action) => ({ nested: action.payload.data }),
        onRequest: (state, action, { multiple }) => ({
          ...state,
          data: multiple ? [] : null,
          pending: state.pending + 1,
          error: null,
          multiple,
        }),
        onSuccess: (state, action, { multiple, getData }) => ({
          ...state,
          data: getData(state, action),
          pending: state.pending - 1,
          error: null,
          multiple,
        }),
        onError: (state, action, { multiple }) => ({
          ...state,
          data: multiple ? [] : null,
          pending: state.pending - 1,
          error: action.payload,
          multiple,
        }),
        onAbort: (state, action, { multiple }) => ({
          ...state,
          pending: state.pending - 1,
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
          operations: null,
        });
      });

      it('returns correct state for request action', () => {
        expect(reducer(initialState, { type: actionType })).toEqual({
          data: [],
          error: null,
          pending: 1,
          operations: null,
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
          pending: -1,
          operations: null,
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
          pending: -1,
          operations: null,
          multiple: true,
        });
      });

      it('returns correct state for abort action', () => {
        const action = { type: abort(actionType) };
        expect(reducer(initialState, action)).toEqual({
          data: [],
          error: null,
          pending: -1,
          operations: null,
          multiple: true,
        });
      });

      it('handles reset action when resetOn is function', () => {
        let nextState = reducer(initialState, { type: actionType });
        nextState = reducer(nextState, { type: actionType });
        expect(reducer(nextState, { type: 'RESET' })).toEqual({
          data: [],
          error: null,
          pending: 2,
          operations: null,
        });
      });
    });

    describe('with passed reducer', () => {
      const notRequestState = { counter: 0 };
      const INCREMENT = 'INCREMENT';
      const RESET = 'RESET';
      const reducer = requestsReducer(
        { actionType, resetOn: [RESET] },
        (state = notRequestState, action) => {
          switch (action.type) {
            case INCREMENT:
              return { ...state, counter: state.counter + 1 };
            default:
              return state;
          }
        },
      );
      const initialState = reducer(undefined, {});

      it('returns correct default state', () => {
        expect(reducer(undefined, {})).toEqual({
          data: null,
          error: null,
          pending: 0,
          operations: null,
          counter: 0,
        });
      });

      it('returns correct state for not handled action', () => {
        const state = 'some_state';
        expect(reducer(state, {})).toBe(state);
      });

      it('returns correct state for request action', () => {
        expect(reducer(initialState, { type: actionType })).toEqual({
          data: null,
          error: null,
          pending: 1,
          operations: null,
          counter: 0,
        });
      });

      it('returns correct state for success action', () => {
        const data = 'data';
        const action = {
          type: success(actionType),
          payload: { data },
        };
        expect(reducer(initialState, action)).toEqual({
          data,
          error: null,
          pending: -1,
          operations: null,
          counter: 0,
        });
      });

      it('returns correct state for error action', () => {
        const someError = 'error';
        const action = {
          type: error(actionType),
          payload: someError,
        };
        expect(reducer(initialState, action)).toEqual({
          data: null,
          error: someError,
          pending: -1,
          operations: null,
          counter: 0,
        });
      });

      it('returns correct state for abort action', () => {
        const action = { type: abort(actionType) };
        expect(reducer(initialState, action)).toEqual({
          data: null,
          error: null,
          pending: -1,
          operations: null,
          counter: 0,
        });
      });

      it('handles action type from passed reducer', () => {
        const action = { type: INCREMENT };
        expect(reducer(initialState, action)).toEqual({
          data: null,
          error: null,
          pending: 0,
          operations: null,
          counter: 1,
        });
      });

      it('handles reset action when resetOn is string array', () => {
        let nextState = reducer(initialState, { type: INCREMENT });
        nextState = reducer(nextState, { type: actionType });
        expect(reducer(nextState, { type: RESET })).toEqual({
          data: null,
          error: null,
          pending: 1,
          operations: null,
          counter: 0,
        });
      });
    });

    describe('with operations', () => {
      const OPERATION_ACTION = 'OPERATION_ACTION';
      const commonReducer = requestsReducer({
        actionType,
        operations: {
          [OPERATION_ACTION]: true,
        },
      });
      const defaultState = {
        data: null,
        error: null,
        pending: 0,
        operations: {
          [OPERATION_ACTION]: {
            error: null,
            pending: 0,
          },
        },
      };

      it('returns default state containing operation default data', () => {
        expect(commonReducer(undefined, {})).toEqual(defaultState);
      });

      it('returns default state containing operation default data with defined requestKey', () => {
        const reducer = requestsReducer({
          actionType,
          operations: {
            [OPERATION_ACTION]: {
              updateData: (state, action) => action.data,
              getRequestKey: action => action.meta.id,
            },
          },
        });
        expect(reducer(undefined, {})).toEqual({
          ...defaultState,
          operations: {
            [OPERATION_ACTION]: {},
          },
        });
      });

      it('increases pending counter on operation request', () => {
        expect(commonReducer(defaultState, { type: OPERATION_ACTION })).toEqual(
          {
            data: null,
            error: null,
            pending: 0,
            operations: {
              [OPERATION_ACTION]: {
                error: null,
                pending: 1,
              },
            },
          },
        );
      });

      it('can update data optimistic', () => {
        const reducer = requestsReducer({
          actionType,
          operations: {
            [OPERATION_ACTION]: {
              updateDataOptimistic: (state, action) => action.data,
            },
          },
        });

        expect(
          reducer(defaultState, { type: OPERATION_ACTION, data: 'data' }),
        ).toEqual({
          data: 'data',
          error: null,
          pending: 0,
          operations: {
            [OPERATION_ACTION]: {
              error: null,
              pending: 1,
            },
          },
        });
      });

      it('increases pending counter on operation request with defined requestKey', () => {
        const reducer = requestsReducer({
          actionType,
          operations: {
            [OPERATION_ACTION]: {
              updateData: true,
              getRequestKey: action => action.meta.id,
            },
          },
        });
        const initialState = reducer(undefined, {});

        let nextState = reducer(initialState, {
          type: OPERATION_ACTION,
          meta: { id: 'a' },
        });
        expect(nextState).toEqual({
          data: null,
          error: null,
          pending: 0,
          operations: {
            [OPERATION_ACTION]: {
              a: {
                error: null,
                pending: 1,
              },
            },
          },
        });

        nextState = reducer(nextState, {
          type: OPERATION_ACTION,
          meta: { id: 'b' },
        });
        expect(nextState).toEqual({
          data: null,
          error: null,
          pending: 0,
          operations: {
            [OPERATION_ACTION]: {
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
          type: OPERATION_ACTION,
          meta: { id: 'a' },
        });
        expect(nextState).toEqual({
          data: null,
          error: null,
          pending: 0,
          operations: {
            [OPERATION_ACTION]: {
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

      it('handles operation success response', () => {
        expect(
          commonReducer(defaultState, {
            type: success(OPERATION_ACTION),
            data: 'response',
            meta: { requestAction: { type: OPERATION_ACTION } },
          }),
        ).toEqual({
          data: 'response',
          error: null,
          pending: 0,
          operations: {
            [OPERATION_ACTION]: {
              error: null,
              pending: -1,
            },
          },
        });
      });

      it('handles operation success response defined as updateData true', () => {
        const reducer = requestsReducer({
          actionType,
          operations: {
            [OPERATION_ACTION]: { updateData: true },
          },
        });
        expect(
          reducer(defaultState, {
            type: success(OPERATION_ACTION),
            data: 'response',
            meta: { requestAction: { type: OPERATION_ACTION } },
          }),
        ).toEqual({
          data: 'response',
          error: null,
          pending: 0,
          operations: {
            [OPERATION_ACTION]: {
              error: null,
              pending: -1,
            },
          },
        });
      });

      it('doesnt override data when a defined operation is false', () => {
        const reducer = requestsReducer({
          actionType,
          operations: {
            [OPERATION_ACTION]: false,
          },
        });

        expect(
          reducer(defaultState, {
            type: success(OPERATION_ACTION),
            data: 'response',
            meta: { requestAction: { type: OPERATION_ACTION } },
          }),
        ).toEqual({
          data: null,
          error: null,
          pending: 0,
          operations: {
            [OPERATION_ACTION]: {
              error: null,
              pending: -1,
            },
          },
        });
      });

      it('doesnt override data when a defined operation is object with key updateData as false', () => {
        const reducer = requestsReducer({
          actionType,
          operations: {
            [OPERATION_ACTION]: { updateData: false },
          },
        });

        expect(
          reducer(defaultState, {
            type: success(OPERATION_ACTION),
            data: 'response',
            meta: { requestAction: { type: OPERATION_ACTION } },
          }),
        ).toEqual({
          data: null,
          error: null,
          pending: 0,
          operations: {
            [OPERATION_ACTION]: {
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
          operations: {
            [OPERATION_ACTION]: true,
          },
        });

        expect(
          reducer(defaultState, {
            type: success(OPERATION_ACTION),
            data: 'response',
            meta: { requestAction: { type: OPERATION_ACTION } },
          }),
        ).toEqual({
          data: 'response',
          error: null,
          pending: 0,
          operations: {
            [OPERATION_ACTION]: {
              error: null,
              pending: -1,
            },
          },
        });
      });

      it('handles updateData customized per operation', () => {
        const reducer = requestsReducer({
          actionType,
          getData: () => null,
          updateData: (state, action) => action.data,
          operations: {
            [OPERATION_ACTION]: (state, action) => action.data.nested,
          },
        });

        expect(
          reducer(defaultState, {
            type: success(OPERATION_ACTION),
            data: { nested: 'response' },
            meta: { requestAction: { type: OPERATION_ACTION } },
          }),
        ).toEqual({
          data: 'response',
          error: null,
          pending: 0,
          operations: {
            [OPERATION_ACTION]: {
              error: null,
              pending: -1,
            },
          },
        });
      });

      it('handles updateData customized per operation defined in updateData object key', () => {
        const reducer = requestsReducer({
          actionType,
          getData: () => null,
          updateData: (state, action) => action.data,
          operations: {
            [OPERATION_ACTION]: {
              updateData: (state, action) => action.data.nested,
            },
          },
        });

        expect(
          reducer(defaultState, {
            type: success(OPERATION_ACTION),
            data: { nested: 'response' },
            meta: { requestAction: { type: OPERATION_ACTION } },
          }),
        ).toEqual({
          data: 'response',
          error: null,
          pending: 0,
          operations: {
            [OPERATION_ACTION]: {
              error: null,
              pending: -1,
            },
          },
        });
      });

      it('handles updateData customized per operation with defined requestKey', () => {
        const reducer = requestsReducer({
          actionType,
          getData: () => null,
          updateData: (state, action) => action.data,
          operations: {
            [OPERATION_ACTION]: {
              updateData: (state, action) => action.data.nested,
              getRequestKey: action => action.meta.id,
            },
          },
        });

        let state = {
          data: null,
          error: null,
          pending: 0,
          operations: {
            [OPERATION_ACTION]: {
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
          type: success(OPERATION_ACTION),
          data: { nested: 'response' },
          meta: {
            requestAction: { type: OPERATION_ACTION, meta: { id: '1' } },
            id: '1',
          },
        });

        expect(state).toEqual({
          data: 'response',
          error: null,
          pending: 0,
          operations: {
            [OPERATION_ACTION]: {
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
          type: success(OPERATION_ACTION),
          data: { nested: 'response2' },
          meta: {
            requestAction: { type: OPERATION_ACTION, meta: { id: '1' } },
            id: '1',
          },
        });

        expect(state).toEqual({
          data: 'response2',
          error: null,
          pending: 0,
          operations: {
            [OPERATION_ACTION]: {
              2: {
                error: null,
                pending: 1,
              },
            },
          },
        });

        state = reducer(state, {
          type: success(OPERATION_ACTION),
          data: { nested: 'response2' },
          meta: {
            requestAction: { type: OPERATION_ACTION, meta: { id: '2' } },
            id: '2',
          },
        });

        expect(state).toEqual({
          data: 'response2',
          error: null,
          pending: 0,
          operations: {
            [OPERATION_ACTION]: {},
          },
        });
      });

      it('handles operation error response', () => {
        expect(
          commonReducer(defaultState, {
            type: error(OPERATION_ACTION),
            error: 'error',
            meta: { requestAction: { type: OPERATION_ACTION } },
          }),
        ).toEqual({
          data: null,
          error: null,
          pending: 0,
          operations: {
            [OPERATION_ACTION]: {
              error: 'error',
              pending: -1,
            },
          },
        });
      });

      it('reverts optimistic update on operation error', () => {
        const reducer = requestsReducer({
          actionType,
          operations: {
            [OPERATION_ACTION]: {
              updateDataOptimistic: (state, action) => action.data,
              revertData: (state, action) => action.meta.requestAction.oldData,
            },
          },
        });

        expect(
          reducer(defaultState, {
            type: error(OPERATION_ACTION),
            error: 'error',
            meta: {
              requestAction: { type: OPERATION_ACTION, oldData: 'oldData' },
            },
          }),
        ).toEqual({
          data: 'oldData',
          error: null,
          pending: 0,
          operations: {
            [OPERATION_ACTION]: {
              error: 'error',
              pending: -1,
            },
          },
        });
      });

      it('handles operation error response with defined requestKey', () => {
        const reducer = requestsReducer({
          actionType,
          operations: {
            [OPERATION_ACTION]: {
              updateData: true,
              getRequestKey: action => action.meta.id,
            },
          },
        });

        let state = {
          data: null,
          error: null,
          pending: 0,
          operations: {
            [OPERATION_ACTION]: {
              1: {
                error: null,
                pending: 2,
              },
            },
          },
        };

        state = reducer(state, {
          type: error(OPERATION_ACTION),
          error: 'error',
          meta: {
            requestAction: { type: OPERATION_ACTION, meta: { id: '1' } },
          },
        });

        expect(state).toEqual({
          data: null,
          error: null,
          pending: 0,
          operations: {
            [OPERATION_ACTION]: {
              1: {
                error: 'error',
                pending: 1,
              },
            },
          },
        });

        state = reducer(state, {
          type: error(OPERATION_ACTION),
          error: 'error2',
          meta: {
            requestAction: { type: OPERATION_ACTION, meta: { id: '1' } },
          },
        });

        expect(state).toEqual({
          data: null,
          error: null,
          pending: 0,
          operations: {
            [OPERATION_ACTION]: {
              1: {
                error: 'error2',
                pending: 0,
              },
            },
          },
        });
      });

      it('handles operation abort response', () => {
        expect(
          commonReducer(defaultState, {
            type: abort(OPERATION_ACTION),
            meta: { requestAction: { type: OPERATION_ACTION } },
          }),
        ).toEqual({
          data: null,
          error: null,
          pending: 0,
          operations: {
            [OPERATION_ACTION]: {
              error: null,
              pending: -1,
            },
          },
        });
      });

      it('reverts optimistic update on operation abort', () => {
        const reducer = requestsReducer({
          actionType,
          operations: {
            [OPERATION_ACTION]: {
              updateDataOptimistic: (state, action) => action.data,
              revertData: (state, action) => action.meta.requestAction.oldData,
            },
          },
        });

        expect(
          reducer(defaultState, {
            type: abort(OPERATION_ACTION),
            meta: {
              requestAction: { type: OPERATION_ACTION, oldData: 'oldData' },
            },
          }),
        ).toEqual({
          data: 'oldData',
          error: null,
          pending: 0,
          operations: {
            [OPERATION_ACTION]: {
              error: null,
              pending: -1,
            },
          },
        });
      });

      it('handles operation abort response with defined requestKey', () => {
        const reducer = requestsReducer({
          actionType,
          operations: {
            [OPERATION_ACTION]: {
              updateData: true,
              getRequestKey: action => action.meta.id,
            },
          },
        });

        let state = {
          data: null,
          error: null,
          pending: 0,
          operations: {
            [OPERATION_ACTION]: {
              1: {
                error: null,
                pending: 2,
              },
            },
          },
        };

        state = reducer(state, {
          type: abort(OPERATION_ACTION),
          meta: {
            requestAction: { type: OPERATION_ACTION, meta: { id: '1' } },
          },
        });

        expect(state).toEqual({
          data: null,
          error: null,
          pending: 0,
          operations: {
            [OPERATION_ACTION]: {
              1: {
                error: null,
                pending: 1,
              },
            },
          },
        });

        state = reducer(state, {
          type: abort(OPERATION_ACTION),
          meta: {
            requestAction: { type: OPERATION_ACTION, meta: { id: '1' } },
          },
        });

        expect(state).toEqual({
          data: null,
          error: null,
          pending: 0,
          operations: {
            [OPERATION_ACTION]: {},
          },
        });
      });
    });
  });
});
