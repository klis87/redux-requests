import { success, error, abort } from './actions';
import { requestsReducer } from './reducers';

const actionType = 'ACTION';

describe('reducers', () => {
  describe('requestsReducer', () => {
    describe('without passed reducer', () => {
      const defaultState = {
        data: null,
        pending: 0,
        error: null,
      };
      const reducer = requestsReducer({ actionType });

      it('returns correct default state', () => {
        const state = reducer(undefined, {});
        const expected = {
          data: null,
          error: null,
          pending: 0,
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
        };
        assert.deepEqual(reducer(defaultState, { type: actionType }), expected);
      });

      it('returns correct state for success action', () => {
        const data = 'data';
        const expected = {
          data,
          error: null,
          pending: -1,
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
        };
        const action = { type: abort(actionType) };
        assert.deepEqual(reducer(defaultState, action), expected);
      });

      it('supports action creator libraries', () => {
        const expected = {
          data: null,
          error: null,
          pending: 1,
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
        };
        assert.deepEqual(state, expected);
      });

      it('returns correct state for request action', () => {
        const expected = {
          data: [],
          error: null,
          pending: 1,
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
          counter: 0,
        };

        let nextState = reducer(initialState, { type: INCREMENT });
        nextState = reducer(nextState, { type: actionType });
        assert.deepEqual(reducer(nextState, { type: RESET }), expected);
      });
    });
  });
});
