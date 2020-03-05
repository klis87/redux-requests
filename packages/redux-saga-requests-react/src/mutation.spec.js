import renderer from 'react-test-renderer';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import Mutation from './mutation';

const mockStore = configureStore();

describe('Mutation', () => {
  const MUTATION_TYPE = 'MUTATION_TYPE';

  it('supports custom selector', () => {
    const component = renderer.create(
      <Provider
        store={mockStore({
          request: {
            mutations: {
              [MUTATION_TYPE]: { pending: 1, error: 'error', ref: {} },
            },
          },
        })}
      >
        <Mutation selector={state => state.request.mutations[MUTATION_TYPE]}>
          {({ loading, error }) => (
            <div>
              {loading && 'loading'}
              {error}
            </div>
          )}
        </Mutation>
      </Provider>,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('maps type to mutation when using networkReducer', () => {
    const component = renderer.create(
      <Provider
        store={mockStore({
          network: {
            mutations: {
              [MUTATION_TYPE]: { pending: 1, error: 'error', ref: {} },
            },
          },
        })}
      >
        <Mutation type={MUTATION_TYPE}>
          {({ loading, error }) => (
            <div>
              {loading && 'loading'}
              {error}
            </div>
          )}
        </Mutation>
      </Provider>,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('maps type to default mutation when no type in networkReducer', () => {
    const component = renderer.create(
      <Provider
        store={mockStore({
          network: {
            mutations: {},
          },
        })}
      >
        <Mutation type={MUTATION_TYPE}>
          {({ loading, error }) => (
            <div>
              {loading && 'loading'}
              {error}
            </div>
          )}
        </Mutation>
      </Provider>,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders loading and error of mutation with requestKey', () => {
    const component = renderer.create(
      <Provider
        store={mockStore({
          network: {
            mutations: {
              [`${MUTATION_TYPE}x`]: { pending: 1, error: 'error', ref: {} },
            },
          },
        })}
      >
        <Mutation type={MUTATION_TYPE} requestKey="x">
          {({ loading, error }) => (
            <div>
              {loading && 'loading'}
              {error}
            </div>
          )}
        </Mutation>
      </Provider>,
    );

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('doesnt crush if an mutation with a requestKey doesnt exist', () => {
    const component = renderer.create(
      <Provider
        store={mockStore({
          network: {
            mutations: {
              [MUTATION_TYPE]: { x: { pending: 1, error: 'error', ref: {} } },
            },
          },
        })}
      >
        <Mutation type={MUTATION_TYPE} requestKey="y">
          {({ loading, error }) => (
            <div>
              {loading && 'loading'}
              {error}
            </div>
          )}
        </Mutation>
      </Provider>,
    );

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders custom component as prop with extra prop', () => {
    const MutationComponent = ({ mutation: { loading, error }, extra }) => (
      <div>
        {loading && 'loading'} {error} {extra}
      </div>
    );

    const component = renderer.create(
      <Provider
        store={mockStore({
          network: {
            mutations: {
              [MUTATION_TYPE]: { pending: 1, error: 'error', ref: {} },
            },
          },
        })}
      >
        <Mutation
          type={MUTATION_TYPE}
          extra="extra"
          component={MutationComponent}
        />
      </Provider>,
    );

    expect(component.toJSON()).toMatchSnapshot();
  });
});
