import renderer from 'react-test-renderer';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import ConnectedQuery from './connected-query';

const mockStore = configureStore();

describe('ConnectedQuery', () => {
  it('maps requestSelector to query', () => {
    const component = renderer.create(
      <Provider
        store={mockStore({
          request: { data: 'data', error: null, pending: 0 },
        })}
      >
        <ConnectedQuery requestSelector={state => state.request}>
          {({ data }) => <div>{data}</div>}
        </ConnectedQuery>
      </Provider>,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});
