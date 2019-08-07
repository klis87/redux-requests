import renderer from 'react-test-renderer';
import React from 'react';

import Query from './query';

describe('Query', () => {
  it('renders null when data is falsy by default', () => {
    const component = renderer.create(
      <Query query={{ data: null, error: null, pending: 0 }}>{null}</Query>,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders null when data is empty array by default', () => {
    const component = renderer.create(
      <Query query={{ data: [], error: null, pending: 0 }}>{[]}</Query>,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders null when custom isDataEmpty returns true', () => {
    const component = renderer.create(
      <Query
        query={{ data: 'empty', error: null, pending: 0 }}
        isDataEmpty={query => !query.data || query.data === 'empty'}
      >
        empty
      </Query>,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('allows passing no data message', () => {
    const component = renderer.create(
      <Query
        query={{ data: null, error: null, pending: 0 }}
        noDataMessage="no data"
      >
        {null}
      </Query>,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders null when pending is positive by default', () => {
    const component = renderer.create(
      <Query query={{ data: 'data', error: null, pending: 1 }}>data</Query>,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('allows rendering custom loading component with extra props', () => {
    const Spinner = ({ extra }) => <span>loading... {extra}</span>;

    const component = renderer.create(
      <Query
        query={{ data: 'data', error: null, pending: 1 }}
        loadingComponent={Spinner}
        loadingComponentProps={{ extra: 'extra' }}
      >
        data
      </Query>,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('throws when passing node as loadingComponent', () => {
    const loggerSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => null);

    try {
      expect(() =>
        renderer.create(
          <Query
            query={{ data: null, error: null, pending: 1 }}
            loadingComponent={<div>loading</div>}
          >
            {null}
          </Query>,
        ),
      ).toThrow();
      expect(loggerSpy).toBeCalled();
    } finally {
      loggerSpy.mockRestore();
    }
  });

  it('renders data even when pending is positive if showLoaderDuringRefetch is false', () => {
    const component = renderer.create(
      <Query
        query={{ data: 'data', error: null, pending: 1 }}
        showLoaderDuringRefetch={false}
      >
        data
      </Query>,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders null when error is truthy by default', () => {
    const component = renderer.create(
      <Query query={{ data: null, error: 'error', pending: 0 }}>{null}</Query>,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('allows rendering custom error component with extra props', () => {
    const Error = ({ error, extra }) => (
      <span>
        {error} {extra}
      </span>
    );

    const component = renderer.create(
      <Query
        query={{ data: null, error: 'error', pending: 0 }}
        errorComponent={Error}
        errorComponentProps={{ extra: 'extra' }}
      >
        {null}
      </Query>,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('throws when passing node as errorComponent', () => {
    const loggerSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => null);

    try {
      expect(() =>
        renderer.create(
          <Query
            query={{ data: null, error: 'error', pending: 0 }}
            errorComponent={<div>error</div>}
          >
            {null}
          </Query>,
        ),
      ).toThrow();
      expect(loggerSpy).toBeCalled();
    } finally {
      loggerSpy.mockRestore();
    }
  });

  it('renders children callback when data in not empty', () => {
    const component = renderer.create(
      <Query query={{ data: 'data', error: null, pending: 0 }}>
        {({ data }) => <span>{data}</span>}
      </Query>,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders children component when data in not empty', () => {
    const Component = ({ children }) => <span>{children}</span>;

    const component = renderer.create(
      <Query query={{ data: 'data', error: null, pending: 0 }}>
        <Component>data</Component>
      </Query>,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders custom prop component with extra props', () => {
    const CustomComponent = ({ query, extra }) => (
      <span>
        {query.data} {extra}
      </span>
    );

    const component = renderer.create(
      <Query
        query={{ data: 'data', error: null, pending: 0 }}
        component={CustomComponent}
        extra="extra"
      />,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});
