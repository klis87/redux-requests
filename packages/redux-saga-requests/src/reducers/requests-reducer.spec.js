import {
  success,
  error,
  abort,
  createSuccessAction,
  createErrorAction,
} from '../actions';
import requestsReducer from './requests-reducer';

describe('reducers', () => {
  describe('requestsReducer', () => {
    const actionType = 'ACTION';

    describe('simple', () => {
      const defaultState = {
        data: null,
        error: null,
        pending: 0,
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
        });
      });

      it('returns correct state for abort action', () => {
        const action = { type: abort(actionType) };
        expect(reducer(defaultState, action)).toEqual({
          data: null,
          error: null,
          pending: -1,
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
        });
      });

      it('supports FSA actions for getting data and error by default', () => {
        const action = {
          type: actionType,
          payload: {
            request: {
              url: '/',
            },
          },
        };

        expect(
          reducer(defaultState, createSuccessAction(action, 'data')),
        ).toEqual({
          data: 'data',
          error: null,
          pending: -1,
        });

        expect(
          reducer(defaultState, createErrorAction(action, 'error')),
        ).toEqual({
          data: null,
          error: 'error',
          pending: -1,
        });
      });
    });

    describe('with config override', () => {
      const RESET = 'RESET';
      const reducer = requestsReducer({
        actionType,
        getData: (state, action) => ({ nested: action.payload.data }),
        resetOn: action => action.type === RESET,
      });
      const initialState = reducer(undefined, {});

      it('returns correct default state', () => {
        expect(reducer(undefined, {})).toEqual({
          data: null,
          error: null,
          pending: 0,
        });
      });

      it('returns correct state for request action', () => {
        expect(reducer(initialState, { type: actionType })).toEqual({
          data: null,
          error: null,
          pending: 1,
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
        });
      });

      it('returns correct state for abort action', () => {
        const action = { type: abort(actionType) };
        expect(reducer(initialState, action)).toEqual({
          data: null,
          error: null,
          pending: -1,
        });
      });

      it('handles reset action when resetOn is function', () => {
        const nextState = reducer(
          { data: 'data', pending: 0, error: null },
          { type: actionType },
        );
        expect(reducer(nextState, { type: 'RESET' })).toEqual({
          data: null,
          error: null,
          pending: 1,
        });
      });

      it('handles reset action when resetOn is the same as the reducer actionType', () => {
        const resetRequestReducer = requestsReducer({
          actionType,
          resetOn: [actionType],
        });

        const state = {
          data: [1, 2, 3],
          error: null,
          pending: 0,
        };
        expect(resetRequestReducer(state, { type: actionType })).toEqual({
          data: null,
          error: null,
          pending: 1,
        });
      });
    });

    describe('with mutations', () => {
      const MUTATION_ACTION = 'MUTATION_ACTION';
      const defaultState = {
        data: null,
        error: null,
        pending: 0,
      };

      it('can update data optimistic', () => {
        const reducer = requestsReducer({ actionType });

        expect(
          reducer(defaultState, {
            type: MUTATION_ACTION,
            data: 'data',
            meta: {
              mutations: {
                [actionType]: {
                  updateDataOptimistic: (state, action) => action.data,
                },
              },
            },
          }),
        ).toEqual({
          data: 'data',
          error: null,
          pending: 0,
        });
      });

      it('handles updateData customized per mutation', () => {
        const reducer = requestsReducer({
          actionType,
        });

        expect(
          reducer(defaultState, {
            type: success(MUTATION_ACTION),
            data: { nested: 'response' },
            meta: {
              requestAction: { type: MUTATION_ACTION },
              mutations: {
                [actionType]: (state, action) => action.data.nested,
              },
            },
          }),
        ).toEqual({
          data: 'response',
          error: null,
          pending: 0,
        });
      });

      it('handles updateData customized per mutation defined in updateData object key', () => {
        const reducer = requestsReducer({
          actionType,
        });

        expect(
          reducer(defaultState, {
            type: success(MUTATION_ACTION),
            data: { nested: 'response' },
            meta: {
              requestAction: { type: MUTATION_ACTION },
              mutations: {
                [actionType]: {
                  updateData: (state, action) => action.data.nested,
                },
              },
            },
          }),
        ).toEqual({
          data: 'response',
          error: null,
          pending: 0,
        });
      });

      it('reverts optimistic update on mutation error', () => {
        const reducer = requestsReducer({
          actionType,
        });

        expect(
          reducer(defaultState, {
            type: error(MUTATION_ACTION),
            error: 'error',
            meta: {
              requestAction: { type: MUTATION_ACTION, oldData: 'oldData' },
              mutations: {
                [actionType]: {
                  updateDataOptimistic: (state, action) => action.data,
                  revertData: (state, action) =>
                    action.meta.requestAction.oldData,
                },
              },
            },
          }),
        ).toEqual({
          data: 'oldData',
          error: null,
          pending: 0,
        });
      });

      it('doesnt change data on mutation error without optimistic update revertData', () => {
        const reducer = requestsReducer({
          actionType,
        });

        expect(
          reducer(
            { ...defaultState, data: 'data' },
            {
              type: error(MUTATION_ACTION),
              error: 'error',
              meta: {
                requestAction: { type: MUTATION_ACTION, oldData: 'oldData' },
                mutations: {
                  [actionType]: {
                    updateDataOptimistic: (state, action) => action.data,
                  },
                },
              },
            },
          ),
        ).toEqual({
          data: 'data',
          error: null,
          pending: 0,
        });
      });

      it('reverts optimistic update on mutation abort', () => {
        const reducer = requestsReducer({
          actionType,
        });

        expect(
          reducer(defaultState, {
            type: abort(MUTATION_ACTION),
            meta: {
              requestAction: { type: MUTATION_ACTION, oldData: 'oldData' },
              mutations: {
                [actionType]: {
                  updateDataOptimistic: (state, action) => action.data,
                  revertData: (state, action) =>
                    action.meta.requestAction.oldData,
                },
              },
            },
          }),
        ).toEqual({
          data: 'oldData',
          error: null,
          pending: 0,
        });
      });
    });

    describe('with local mutations', () => {
      const LOCAL_MUTATION_ACTION = 'LOCAL_MUTATION_ACTION';
      const commonReducer = requestsReducer({
        actionType,
      });
      const defaultState = {
        data: null,
        error: null,
        pending: 0,
      };

      it('updates data for local mutation and doesnt keep local mutation state', () => {
        expect(
          commonReducer(defaultState, {
            type: LOCAL_MUTATION_ACTION,
            data: 'data',
            meta: {
              mutations: {
                [actionType]: {
                  local: true,
                  updateData: (state, action) => action.data,
                },
              },
            },
          }),
        ).toEqual({ ...defaultState, data: 'data' });
      });
    });
  });
});
