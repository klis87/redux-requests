import renderer from 'react-test-renderer';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import ConnectedRequestContainer from './connected-request-container';

const mockStore = configureStore();

describe('ConnectedRequestContainer', () => {
  it('maps requestSelector to request', () => {
    const component = renderer.create(
      <Provider
        store={mockStore({
          request: { data: 'data', error: null, pending: 0 },
        })}
      >
        <ConnectedRequestContainer requestSelector={state => state.request}>
          {({ data }) => <div>{data}</div>}
        </ConnectedRequestContainer>
      </Provider>,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});
