import renderer from 'react-test-renderer';
import React from 'react';

import OperationContainer from './operation-container';

describe('OperationContainer', () => {
  it('renders loading and error', () => {
    const component = renderer.create(
      <OperationContainer operation={{ pending: 1, error: 'error' }}>
        {({ loading, error }) => (
          <div>
            {loading && 'loading'}
            {error}
          </div>
        )}
      </OperationContainer>,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders loading and error of operation with requestKey', () => {
    const component = renderer.create(
      <OperationContainer
        requestKey="x"
        operation={{ x: { pending: 1, error: 'error' } }}
      >
        {({ loading, error }) => (
          <div>
            {loading && 'loading'}
            {error}
          </div>
        )}
      </OperationContainer>,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('doesnt crush if an operation with a requestKey doesnt exist', () => {
    const component = renderer.create(
      <OperationContainer
        requestKey="y"
        operation={{ x: { pending: 1, error: 'error' } }}
      >
        {({ loading, error }) => (
          <div>
            {loading && 'loading'}
            {error}
          </div>
        )}
      </OperationContainer>,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders custom component as prop with extra prop', () => {
    const OperationComponent = ({ loading, error, extra }) => (
      <div>
        {loading && 'loading'} {error} {extra}
      </div>
    );

    const component = renderer.create(
      <OperationContainer
        operation={{ pending: 1, error: 'error' }}
        extra="extra"
        component={OperationComponent}
      />,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});
