import renderer from 'react-test-renderer';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import ConnectedMutation from './connected-mutation';

const mockStore = configureStore();

describe('ConnectedMutation', () => {
  it('maps requestSelector to mutation with type prop', () => {
    const mutationType = 'MUTATION';
    const component = renderer.create(
      <Provider
        store={mockStore({
          request: {
            mutations: { [mutationType]: { pending: 1, error: 'error' } },
          },
        })}
      >
        <ConnectedMutation
          requestSelector={state => state.request}
          type={mutationType}
        >
          {({ loading, error }) => (
            <div>
              {loading && 'loading'}
              {error}
            </div>
          )}
        </ConnectedMutation>
      </Provider>,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('maps requestSelector to mutation with type prop as action creator', () => {
    const mutationAction = () => {};
    mutationAction.toString = () => 'MUTATION';

    const component = renderer.create(
      <Provider
        store={mockStore({
          request: {
            mutations: { MUTATION: { pending: 1, error: 'error' } },
          },
        })}
      >
        <ConnectedMutation
          requestSelector={state => state.request}
          type={mutationAction}
        >
          {({ loading, error }) => (
            <div>
              {loading && 'loading'}
              {error}
            </div>
          )}
        </ConnectedMutation>
      </Provider>,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});
