import renderer from 'react-test-renderer';
import React from 'react';

import Mutation from './mutation';

describe('Mutation', () => {
  it('renders loading and error', () => {
    const component = renderer.create(
      <Mutation mutation={{ pending: 1, error: 'error' }}>
        {({ loading, error }) => (
          <div>
            {loading && 'loading'}
            {error}
          </div>
        )}
      </Mutation>,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders loading and error of mutation with requestKey', () => {
    const component = renderer.create(
      <Mutation requestKey="x" mutation={{ x: { pending: 1, error: 'error' } }}>
        {({ loading, error }) => (
          <div>
            {loading && 'loading'}
            {error}
          </div>
        )}
      </Mutation>,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('doesnt crush if an mutation with a requestKey doesnt exist', () => {
    const component = renderer.create(
      <Mutation requestKey="y" mutation={{ x: { pending: 1, error: 'error' } }}>
        {({ loading, error }) => (
          <div>
            {loading && 'loading'}
            {error}
          </div>
        )}
      </Mutation>,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders custom component as prop with extra prop', () => {
    const MutationComponent = ({ loading, error, extra }) => (
      <div>
        {loading && 'loading'} {error} {extra}
      </div>
    );

    const component = renderer.create(
      <Mutation
        mutation={{ pending: 1, error: 'error' }}
        extra="extra"
        component={MutationComponent}
      />,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});
