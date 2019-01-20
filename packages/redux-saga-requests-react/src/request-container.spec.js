import renderer from 'react-test-renderer';
import React from 'react';

import RequestContainer from './request-container';

describe('RequestContainer', () => {
  it('renders null when data is falsy by default', () => {
    const component = renderer.create(
      <RequestContainer request={{ data: null, error: null, pending: 0 }}>
        {null}
      </RequestContainer>,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders null when data is empty array by default', () => {
    const component = renderer.create(
      <RequestContainer request={{ data: [], error: null, pending: 0 }}>
        {[]}
      </RequestContainer>,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders null when custom isDataEmpty returns true', () => {
    const component = renderer.create(
      <RequestContainer
        request={{ data: 'empty', error: null, pending: 0 }}
        isDataEmpty={request => !request.data || request.data === 'empty'}
      >
        empty
      </RequestContainer>,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('allows passing no data message', () => {
    const component = renderer.create(
      <RequestContainer
        request={{ data: null, error: null, pending: 0 }}
        noDataMessage="no data"
      >
        {null}
      </RequestContainer>,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders null when pending is positive by default', () => {
    const component = renderer.create(
      <RequestContainer request={{ data: 'data', error: null, pending: 1 }}>
        data
      </RequestContainer>,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('allows rendering custom loading component with extra props', () => {
    const Spinner = ({ extra }) => <span>loading... {extra}</span>;

    const component = renderer.create(
      <RequestContainer
        request={{ data: 'data', error: null, pending: 1 }}
        loadingComponent={Spinner}
        loadingComponentProps={{ extra: 'extra' }}
      >
        data
      </RequestContainer>,
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
          <RequestContainer
            request={{ data: null, error: null, pending: 1 }}
            loadingComponent={<div>loading</div>}
          >
            {null}
          </RequestContainer>,
        ),
      ).toThrow();
      expect(loggerSpy).toBeCalled();
    } finally {
      loggerSpy.mockRestore();
    }
  });

  it('renders data even when pending is positive if showLoaderDuringRefetch is false', () => {
    const component = renderer.create(
      <RequestContainer
        request={{ data: 'data', error: null, pending: 1 }}
        showLoaderDuringRefetch={false}
      >
        data
      </RequestContainer>,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders null when error is truthy by default', () => {
    const component = renderer.create(
      <RequestContainer request={{ data: null, error: 'error', pending: 0 }}>
        {null}
      </RequestContainer>,
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
      <RequestContainer
        request={{ data: null, error: 'error', pending: 0 }}
        errorComponent={Error}
        errorComponentProps={{ extra: 'extra' }}
      >
        {null}
      </RequestContainer>,
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
          <RequestContainer
            request={{ data: null, error: 'error', pending: 0 }}
            errorComponent={<div>error</div>}
          >
            {null}
          </RequestContainer>,
        ),
      ).toThrow();
      expect(loggerSpy).toBeCalled();
    } finally {
      loggerSpy.mockRestore();
    }
  });

  it('renders children callback when data in not empty', () => {
    const component = renderer.create(
      <RequestContainer request={{ data: 'data', error: null, pending: 0 }}>
        {({ data }) => <span>{data}</span>}
      </RequestContainer>,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders children component when data in not empty', () => {
    const Component = ({ children }) => <span>{children}</span>;

    const component = renderer.create(
      <RequestContainer request={{ data: 'data', error: null, pending: 0 }}>
        <Component>data</Component>
      </RequestContainer>,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders custom prop component with extra props', () => {
    const CustomComponent = ({ request, extra }) => (
      <span>
        {request.data} {extra}
      </span>
    );

    const component = renderer.create(
      <RequestContainer
        request={{ data: 'data', error: null, pending: 0 }}
        component={CustomComponent}
        extra="extra"
      />,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
});
