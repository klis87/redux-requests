import { success, error } from './actions';
import { requestsReducer } from './reducers';

const actionType = 'ACTION';

describe('reducers', () => {
  describe('requestsReducer', () => {
    describe('without passed reducer', () => {
      const defaultState = {
        data: null,
        fetching: false,
        error: null,
      };
      const reducer = requestsReducer({ actionType });

      it('returns correct default state', () => {
        const state = reducer(undefined, {});
        const expected = {
          data: null,
          error: null,
          fetching: false,
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
          fetching: true,
        };
        assert.deepEqual(reducer(defaultState, { type: actionType }), expected);
      });

      it('returns correct state for success action', () => {
        const data = 'data';
        const expected = {
          data,
          error: null,
          fetching: false,
        };
        const action = {
          type: success(actionType),
          payload: { data },
        };
        assert.deepEqual(reducer(defaultState, action), expected);
      });

      it('returns correct state for error action', () => {
        const someError = 'error';
        const expected = {
          data: null,
          error: someError,
          fetching: false,
        };
        const action = {
          type: error(actionType),
          payload: { error: someError },
        };
        assert.deepEqual(reducer(defaultState, action), expected);
      });
    });

    describe('without passed reducer with array data', () => {
      const reducer = requestsReducer({ actionType, multiple: true });
      const initialState = reducer(undefined, {});

      it('returns correct default state', () => {
        const state = reducer(undefined, {});
        const expected = {
          data: [],
          error: null,
          fetching: false,
        };
        assert.deepEqual(state, expected);
      });

      it('returns correct state for request action', () => {
        const expected = {
          data: [],
          error: null,
          fetching: true,
        };
        assert.deepEqual(reducer(initialState, { type: actionType }), expected);
      });

      it('returns correct state for success action', () => {
        const data = ['data'];
        const expected = {
          data,
          error: null,
          fetching: false,
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
          fetching: false,
        };
        const action = {
          type: error(actionType),
          payload: { error: someError },
        };
        assert.deepEqual(reducer(initialState, action), expected);
      });
    });

    describe('with passed reducer', () => {
      const notRequestState = { counter: 0 };
      const INCREMENT = 'INCREMENT';
      const reducer = requestsReducer({ actionType }, (state = notRequestState, action) => {
        switch (action.type) {
          case INCREMENT:
            return { ...state, counter: state.counter + 1 };
          default:
            return state;
        }
      });
      const initialState = reducer(undefined, {});

      it('returns correct default state', () => {
        const state = reducer(undefined, {});
        const expected = {
          data: null,
          error: null,
          fetching: false,
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
          fetching: true,
          counter: 0,
        };
        assert.deepEqual(reducer(initialState, { type: actionType }), expected);
      });

      it('returns correct state for success action', () => {
        const data = 'data';
        const expected = {
          data,
          error: null,
          fetching: false,
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
          fetching: false,
          counter: 0,
        };
        const action = {
          type: error(actionType),
          payload: { error: someError },
        };
        assert.deepEqual(reducer(initialState, action), expected);
      });

      it('handles action type from passed reducer', () => {
        const expected = {
          data: null,
          error: null,
          fetching: false,
          counter: 1,
        };
        const action = { type: INCREMENT };
        assert.deepEqual(reducer(initialState, action), expected);
      });
    });
  });
});
