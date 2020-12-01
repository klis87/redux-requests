import renderer from 'react-test-renderer';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import Query from './query';

const mockStore = configureStore();

describe('Query', () => {
  const QUERY_TYPE = 'QUERY_TYPE';

  it('supports custom query selector', () => {
    const component = renderer.create(
      <Provider
        store={mockStore({
          request: { data: 'data', error: null, loading: false, ref: {} },
        })}
      >
        <Query selector={state => state.request}>
          {({ data }) => <div>{data}</div>}
        </Query>
      </Provider>,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('maps type to query', () => {
    const component = renderer.create(
      <Provider
        store={mockStore({
          requests: {
            queries: {
              [QUERY_TYPE]: { data: 'data', error: null, pending: 0, ref: {} },
            },
            downloadProgress: {},
            uploadProgress: {},
          },
        })}
      >
        <Query type={QUERY_TYPE}>{({ data }) => <div>{data}</div>}</Query>
      </Provider>,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('maps type to default query data when request state not found', () => {
    const component = renderer.create(
      <Provider
        store={mockStore({
          requests: {
            queries: {},
            downloadProgress: {},
            uploadProgress: {},
          },
        })}
      >
        <Query type={QUERY_TYPE}>{({ data }) => <div>{data}</div>}</Query>
      </Provider>,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders null when data is falsy by default', () => {
    const component = renderer.create(
      <Provider
        store={mockStore({
          requests: {
            queries: {
              [QUERY_TYPE]: { data: null, error: null, pending: 0, ref: {} },
            },
            downloadProgress: {},
            uploadProgress: {},
          },
        })}
      >
        <Query type={QUERY_TYPE}>{({ data }) => <div>{data}</div>}</Query>
      </Provider>,
    );

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders null when data is empty array by default', () => {
    const component = renderer.create(
      <Provider
        store={mockStore({
          requests: {
            queries: {
              [QUERY_TYPE]: { data: [], error: null, pending: 0, ref: {} },
            },
            downloadProgress: {},
            uploadProgress: {},
          },
        })}
      >
        <Query type={QUERY_TYPE}>
          {({ data }) => (
            <div>
              {data.map(v => (
                <span key={v}>{v}</span>
              ))}
            </div>
          )}
        </Query>
      </Provider>,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders null when custom isDataEmpty returns true', () => {
    const component = renderer.create(
      <Provider
        store={mockStore({
          requests: {
            queries: {
              [QUERY_TYPE]: { data: 'empty', error: null, pending: 0, ref: {} },
            },
            downloadProgress: {},
            uploadProgress: {},
          },
        })}
      >
        <Query
          type={QUERY_TYPE}
          isDataEmpty={query => !query.data || query.data === 'empty'}
        >
          {({ data }) => <div>{data}</div>}
        </Query>
      </Provider>,
    );

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('uses defaultData prop when data is null', () => {
    const component = renderer.create(
      <Provider
        store={mockStore({
          requests: {
            queries: {
              [QUERY_TYPE]: { data: null, error: null, pending: 0, ref: {} },
            },
            downloadProgress: {},
            uploadProgress: {},
          },
        })}
      >
        <Query type={QUERY_TYPE} defaultData={1}>
          {({ data }) => <div>{data}</div>}
        </Query>
      </Provider>,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('uses array as empty data when multiple is true', () => {
    const component = renderer.create(
      <Provider
        store={mockStore({
          requests: {
            queries: {
              [QUERY_TYPE]: { data: null, error: null, pending: 0, ref: {} },
            },
            downloadProgress: {},
            uploadProgress: {},
          },
        })}
      >
        <Query type={QUERY_TYPE} multiple isDataEmpty={query => !query.data}>
          {({ data }) => <div>array length: {data.length}</div>}
        </Query>
      </Provider>,
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('allows passing no data message', () => {
    const component = renderer.create(
      <Provider
        store={mockStore({
          requests: {
            queries: {
              [QUERY_TYPE]: { data: null, error: null, pending: 0, ref: {} },
            },
            downloadProgress: {},
            uploadProgress: {},
          },
        })}
      >
        <Query noDataMessage="no data" type={QUERY_TYPE}>
          {({ data }) => <div>{data}</div>}
        </Query>
      </Provider>,
    );

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders null when pending is positive by default', () => {
    const component = renderer.create(
      <Provider
        store={mockStore({
          requests: {
            queries: {
              [QUERY_TYPE]: { data: 'data', error: null, pending: 1, ref: {} },
            },
            downloadProgress: {},
            uploadProgress: {},
          },
        })}
      >
        <Query type={QUERY_TYPE}>{({ data }) => <div>{data}</div>}</Query>
      </Provider>,
    );

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('allows rendering custom loading component with extra props', () => {
    const Spinner = ({ extra }) => <span>loading... {extra}</span>;

    const component = renderer.create(
      <Provider
        store={mockStore({
          requests: {
            queries: {
              [QUERY_TYPE]: { data: 'data', error: null, pending: 1, ref: {} },
            },
            downloadProgress: {},
            uploadProgress: {},
          },
        })}
      >
        <Query
          type={QUERY_TYPE}
          loadingComponent={Spinner}
          loadingComponentProps={{ extra: 'extra' }}
        >
          {({ data }) => <div>{data}</div>}
        </Query>
      </Provider>,
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
          <Provider
            store={mockStore({
              requests: {
                queries: {
                  [QUERY_TYPE]: {
                    data: 'data',
                    error: null,
                    pending: 1,
                    ref: {},
                  },
                },
                downloadProgress: {},
                uploadProgress: {},
              },
            })}
          >
            <Query type={QUERY_TYPE} loadingComponent={<div>loading</div>}>
              {({ data }) => <div>{data}</div>}
            </Query>
          </Provider>,
        ),
      ).toThrow();
      expect(loggerSpy).toBeCalled();
    } finally {
      loggerSpy.mockRestore();
    }
  });

  it('renders data even when pending is positive if showLoaderDuringRefetch is false', () => {
    const component = renderer.create(
      <Provider
        store={mockStore({
          requests: {
            queries: {
              [QUERY_TYPE]: { data: 'data', error: null, pending: 1, ref: {} },
            },
            downloadProgress: {},
            uploadProgress: {},
          },
        })}
      >
        <Query type={QUERY_TYPE} showLoaderDuringRefetch={false}>
          {({ data }) => <div>{data}</div>}
        </Query>
      </Provider>,
    );

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders null when error is truthy by default', () => {
    const component = renderer.create(
      <Provider
        store={mockStore({
          requests: {
            queries: {
              [QUERY_TYPE]: {
                data: 'data',
                error: 'error',
                pending: 0,
                ref: {},
              },
            },
            downloadProgress: {},
            uploadProgress: {},
          },
        })}
      >
        <Query type={QUERY_TYPE}>{({ data }) => <div>{data}</div>}</Query>
      </Provider>,
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
      <Provider
        store={mockStore({
          requests: {
            queries: {
              [QUERY_TYPE]: {
                data: 'data',
                error: 'error',
                pending: 0,
                ref: {},
              },
            },
            downloadProgress: {},
            uploadProgress: {},
          },
        })}
      >
        <Query
          type={QUERY_TYPE}
          errorComponent={Error}
          errorComponentProps={{ extra: 'extra' }}
        >
          {({ data }) => <div>{data}</div>}
        </Query>
      </Provider>,
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
          <Provider
            store={mockStore({
              requests: {
                queries: {
                  [QUERY_TYPE]: {
                    data: 'data',
                    error: 'error',
                    pending: 0,
                    ref: {},
                  },
                },
                downloadProgress: {},
                uploadProgress: {},
              },
            })}
          >
            <Query type={QUERY_TYPE} errorComponent={<div>error</div>}>
              {({ data }) => <div>{data}</div>}
            </Query>
          </Provider>,
        ),
      ).toThrow();
      expect(loggerSpy).toBeCalled();
    } finally {
      loggerSpy.mockRestore();
    }
  });

  it('renders custom prop component with extra props', () => {
    const CustomComponent = ({ query, extra }) => (
      <span>
        {query.data} {extra}
      </span>
    );

    const component = renderer.create(
      <Provider
        store={mockStore({
          requests: {
            queries: {
              [QUERY_TYPE]: { data: 'data', error: null, pending: 0, ref: {} },
            },
            downloadProgress: {},
            uploadProgress: {},
          },
        })}
      >
        <Query type={QUERY_TYPE} component={CustomComponent} extra="extra" />
      </Provider>,
    );

    expect(component.toJSON()).toMatchSnapshot();
  });
});
