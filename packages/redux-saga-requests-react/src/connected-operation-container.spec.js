import renderer from 'react-test-renderer';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import ConnectedOperationContainer from './connected-operation-container';

const mockStore = configureStore();

describe('ConnectedOperationContainer', () => {
  it('maps requestSelector to operation with operationType', () => {
    const operationType = 'OPERATION';
    const component = renderer.create(
      <Provider
        store={mockStore({
          request: {
            operations: { [operationType]: { pending: 1, error: 'error' } },
          },
        })}
      >
        <ConnectedOperationContainer
          requestSelector={state => state.request}
          operationType={operationType}
        >
          {({ loading, error }) => (
            <div>
              {loading && 'loading'}
              {error}
            </div>
          )}
        </ConnectedOperationContainer>
      </Provider>,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('maps requestSelector to operation with operationActionCreator and passes sendOperation', () => {
    const operationType = 'OPERATION';
    const operationCreator = () => ({
      type: operationType,
      request: { url: '/' },
    });
    operationCreator.toString = () => operationType;
    const component = renderer.create(
      <Provider
        store={mockStore({
          request: {
            operations: { [operationType]: { pending: 1, error: 'error' } },
          },
        })}
      >
        <ConnectedOperationContainer
          requestSelector={state => state.request}
          operationCreator={operationCreator}
        >
          {({ loading, error, sendOperation }) => (
            <div>
              {loading && 'loading'}
              {error}
              <button type="button" onClick={sendOperation}>
                Send operation
              </button>
            </div>
          )}
        </ConnectedOperationContainer>
      </Provider>,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});
