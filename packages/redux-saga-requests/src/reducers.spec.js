import { assert } from 'chai';

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
        const state = reducer(undefined, {});
        assert.deepEqual(state, defaultState);
      });

      it('returns correct state for not handled action', () => {
        const state = 'some_state';
        assert.equal(reducer(state, {}), state);
      });

      it('returns correct state for request action', () => {
        const expected = {
          data: null,
          error: null,
          pending: 1,
          operations: null,
        };
        assert.deepEqual(reducer(defaultState, { type: actionType }), expected);
      });

      it('returns correct state for success action', () => {
        const data = 'data';
        const expected = {
          data,
          error: null,
          pending: -1,
          operations: null,
        };
        const action = {
          type: success(actionType),
          data,
        };
        assert.deepEqual(reducer(defaultState, action), expected);
      });

      it('returns correct state for error action', () => {
        const someError = 'error';
        const expected = {
          data: null,
          error: someError,
          pending: -1,
          operations: null,
        };
        const action = {
          type: error(actionType),
          error: someError,
        };
        assert.deepEqual(reducer(defaultState, action), expected);
      });

      it('returns correct state for abort action', () => {
        const expected = {
          data: null,
          error: null,
          pending: -1,
          operations: null,
        };
        const action = { type: abort(actionType) };
        assert.deepEqual(reducer(defaultState, action), expected);
      });

      it('supports action creator libraries', () => {
        const expected = {
          data: null,
          error: null,
          pending: 1,
          operations: null,
        };
        const action = () => ({ type: actionType });
        action.toString = () => actionType;
        const reduxActReducer = requestsReducer({ actionType: action });
        assert.deepEqual(reduxActReducer(defaultState, action()), expected);
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
        const state = reducer(undefined, {});
        const expected = {
          data: [],
          error: null,
          pending: 0,
          operations: null,
        };
        assert.deepEqual(state, expected);
      });

      it('returns correct state for request action', () => {
        const expected = {
          data: [],
          error: null,
          pending: 1,
          operations: null,
          multiple: true,
        };
        assert.deepEqual(reducer(initialState, { type: actionType }), expected);
      });

      it('returns correct state for success action', () => {
        const data = ['data'];
        const expected = {
          data: { nested: data },
          error: null,
          pending: -1,
          operations: null,
          multiple: true,
        };
        const action = {
          type: success(actionType),
          payload: { data },
        };
        assert.deepEqual(reducer(initialState, action), expected);
      });

      it('returns correct state for error action', () => {
        const someError = 'error';
        const expected = {
          data: [],
          error: someError,
          pending: -1,
          operations: null,
          multiple: true,
        };
        const action = {
          type: error(actionType),
          payload: someError,
        };
        assert.deepEqual(reducer(initialState, action), expected);
      });

      it('returns correct state for abort action', () => {
        const expected = {
          data: [],
          error: null,
          pending: -1,
          operations: null,
          multiple: true,
        };
        const action = { type: abort(actionType) };
        assert.deepEqual(reducer(initialState, action), expected);
      });

      it('handles reset action when resetOn is function', () => {
        const expected = {
          data: [],
          error: null,
          pending: 2,
          operations: null,
        };

        let nextState = reducer(initialState, { type: actionType });
        nextState = reducer(nextState, { type: actionType });
        assert.deepEqual(reducer(nextState, { type: 'RESET' }), expected);
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
        const state = reducer(undefined, {});
        const expected = {
          data: null,
          error: null,
          pending: 0,
          operations: null,
          counter: 0,
        };
        assert.deepEqual(state, expected);
      });

      it('returns correct state for not handled action', () => {
        const state = 'some_state';
        assert.equal(reducer(state, {}), state);
      });

      it('returns correct state for request action', () => {
        const expected = {
          data: null,
          error: null,
          pending: 1,
          operations: null,
          counter: 0,
        };
        assert.deepEqual(reducer(initialState, { type: actionType }), expected);
      });

      it('returns correct state for success action', () => {
        const data = 'data';
        const expected = {
          data,
          error: null,
          pending: -1,
          operations: null,
          counter: 0,
        };
        const action = {
          type: success(actionType),
          payload: { data },
        };
        assert.deepEqual(reducer(initialState, action), expected);
      });

      it('returns correct state for error action', () => {
        const someError = 'error';
        const expected = {
          data: null,
          error: someError,
          pending: -1,
          operations: null,
          counter: 0,
        };
        const action = {
          type: error(actionType),
          payload: someError,
        };
        assert.deepEqual(reducer(initialState, action), expected);
      });

      it('returns correct state for abort action', () => {
        const expected = {
          data: null,
          error: null,
          pending: -1,
          operations: null,
          counter: 0,
        };
        const action = { type: abort(actionType) };
        assert.deepEqual(reducer(initialState, action), expected);
      });

      it('handles action type from passed reducer', () => {
        const expected = {
          data: null,
          error: null,
          pending: 0,
          operations: null,
          counter: 1,
        };
        const action = { type: INCREMENT };
        assert.deepEqual(reducer(initialState, action), expected);
      });

      it('handles reset action when resetOn is string array', () => {
        const expected = {
          data: null,
          error: null,
          pending: 1,
          operations: null,
          counter: 0,
        };

        let nextState = reducer(initialState, { type: INCREMENT });
        nextState = reducer(nextState, { type: actionType });
        assert.deepEqual(reducer(nextState, { type: RESET }), expected);
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
        assert.deepEqual(commonReducer(undefined, {}), defaultState);
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
        assert.deepEqual(reducer(undefined, {}), {
          ...defaultState,
          operations: {
            [OPERATION_ACTION]: {},
          },
        });
      });

      it('increases pending counter on operation request', () => {
        const expectedState = {
          data: null,
          error: null,
          pending: 0,
          operations: {
            [OPERATION_ACTION]: {
              error: null,
              pending: 1,
            },
          },
        };

        assert.deepEqual(
          commonReducer(defaultState, { type: OPERATION_ACTION }),
          expectedState,
        );
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
        assert.deepEqual(nextState, {
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
        assert.deepEqual(nextState, {
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
        assert.deepEqual(nextState, {
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
        const expectedState = {
          data: 'response',
          error: null,
          pending: 0,
          operations: {
            [OPERATION_ACTION]: {
              error: null,
              pending: -1,
            },
          },
        };

        assert.deepEqual(
          commonReducer(defaultState, {
            type: success(OPERATION_ACTION),
            data: 'response',
            meta: { requestAction: { type: OPERATION_ACTION } },
          }),
          expectedState,
        );
      });

      it('handles operation success response defined as updateData true', () => {
        const reducer = requestsReducer({
          actionType,
          operations: {
            [OPERATION_ACTION]: { updateData: true },
          },
        });
        const expectedState = {
          data: 'response',
          error: null,
          pending: 0,
          operations: {
            [OPERATION_ACTION]: {
              error: null,
              pending: -1,
            },
          },
        };

        assert.deepEqual(
          reducer(defaultState, {
            type: success(OPERATION_ACTION),
            data: 'response',
            meta: { requestAction: { type: OPERATION_ACTION } },
          }),
          expectedState,
        );
      });

      it('doesnt override data when a defined operation is false', () => {
        const reducer = requestsReducer({
          actionType,
          operations: {
            [OPERATION_ACTION]: false,
          },
        });

        const expectedState = {
          data: null,
          error: null,
          pending: 0,
          operations: {
            [OPERATION_ACTION]: {
              error: null,
              pending: -1,
            },
          },
        };

        assert.deepEqual(
          reducer(defaultState, {
            type: success(OPERATION_ACTION),
            data: 'response',
            meta: { requestAction: { type: OPERATION_ACTION } },
          }),
          expectedState,
        );
      });

      it('doesnt override data when a defined operation is object with key updateData as false', () => {
        const reducer = requestsReducer({
          actionType,
          operations: {
            [OPERATION_ACTION]: { updateData: false },
          },
        });

        const expectedState = {
          data: null,
          error: null,
          pending: 0,
          operations: {
            [OPERATION_ACTION]: {
              error: null,
              pending: -1,
            },
          },
        };

        assert.deepEqual(
          reducer(defaultState, {
            type: success(OPERATION_ACTION),
            data: 'response',
            meta: { requestAction: { type: OPERATION_ACTION } },
          }),
          expectedState,
        );
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

        const expectedState = {
          data: 'response',
          error: null,
          pending: 0,
          operations: {
            [OPERATION_ACTION]: {
              error: null,
              pending: -1,
            },
          },
        };

        assert.deepEqual(
          reducer(defaultState, {
            type: success(OPERATION_ACTION),
            data: 'response',
            meta: { requestAction: { type: OPERATION_ACTION } },
          }),
          expectedState,
        );
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

        const expectedState = {
          data: 'response',
          error: null,
          pending: 0,
          operations: {
            [OPERATION_ACTION]: {
              error: null,
              pending: -1,
            },
          },
        };

        assert.deepEqual(
          reducer(defaultState, {
            type: success(OPERATION_ACTION),
            data: { nested: 'response' },
            meta: { requestAction: { type: OPERATION_ACTION } },
          }),
          expectedState,
        );
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

        const expectedState = {
          data: 'response',
          error: null,
          pending: 0,
          operations: {
            [OPERATION_ACTION]: {
              error: null,
              pending: -1,
            },
          },
        };

        assert.deepEqual(
          reducer(defaultState, {
            type: success(OPERATION_ACTION),
            data: { nested: 'response' },
            meta: { requestAction: { type: OPERATION_ACTION } },
          }),
          expectedState,
        );
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

        assert.deepEqual(state, {
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

        assert.deepEqual(state, {
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

        assert.deepEqual(state, {
          data: 'response2',
          error: null,
          pending: 0,
          operations: {
            [OPERATION_ACTION]: {},
          },
        });
      });

      it('handles operation error response', () => {
        const expectedState = {
          data: null,
          error: null,
          pending: 0,
          operations: {
            [OPERATION_ACTION]: {
              error: 'error',
              pending: -1,
            },
          },
        };

        assert.deepEqual(
          commonReducer(defaultState, {
            type: error(OPERATION_ACTION),
            error: 'error',
            meta: { requestAction: { type: OPERATION_ACTION } },
          }),
          expectedState,
        );
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

        assert.deepEqual(state, {
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

        assert.deepEqual(state, {
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
        const expectedState = {
          data: null,
          error: null,
          pending: 0,
          operations: {
            [OPERATION_ACTION]: {
              error: null,
              pending: -1,
            },
          },
        };

        assert.deepEqual(
          commonReducer(defaultState, {
            type: abort(OPERATION_ACTION),
            meta: { requestAction: { type: OPERATION_ACTION } },
          }),
          expectedState,
        );
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

        assert.deepEqual(state, {
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

        assert.deepEqual(state, {
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
