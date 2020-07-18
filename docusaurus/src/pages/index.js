import React from 'react';
import classnames from 'classnames';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Highlight, { defaultProps } from 'prism-react-renderer';
import theme from 'prism-react-renderer/themes/nightOwl';

import styles from './styles.module.css';

const features = [
  {
    title: <>Just actions</>,
    imageUrl: 'img/undraw_letter.svg',
    description: (
      <>
        Just dispatch actions and enjoy automatic AJAX requests and network
        state management
      </>
    ),
  },
  {
    title: <>First class aborts support</>,
    imageUrl: 'img/undraw_cancel.svg',
    description: (
      <>
        Automatic and configurable requests aborts, which increases performance
        and prevents race condition bugs before they even happen
      </>
    ),
  },
  {
    title: <>Drivers driven</>,
    imageUrl: 'img/undraw_by_my_car.svg',
    description: (
      <>
        Compatible with anything for server communication. Axios, Fetch API,
        GraphQL, promise libraries, mocking? No problem! You can also integrate
        it with other ways by writing a custom driver!
      </>
    ),
  },
  {
    title: <>Batch requests</>,
    imageUrl: 'img/undraw_portfolio.svg',
    description: <>Define multiple requests in single action</>,
  },
  {
    title: <>Optimistic updates</>,
    imageUrl: 'img/undraw_to_the_stars.svg',
    description: (
      <>
        Update remote data before receiving server response to improve perceived
        performance
      </>
    ),
  },
  {
    title: <>Cache</>,
    imageUrl: 'img/undraw_memory_storage.svg',
    description: (
      <>
        Cache server response forever or for a defined time period to decrease
        amount of network calls
      </>
    ),
  },
  {
    title: <>Data normalisation</>,
    imageUrl: 'img/undraw_data_processing.svg',
    description: (
      <>
        Use automatic data normalisation in GraphQL Apollo fashion, but for
        anything, including REST!
      </>
    ),
  },
  {
    title: <>Server side rendering</>,
    imageUrl: 'img/undraw_server.svg',
    description: (
      <>
        Configure SSR totally on Redux level and write truly universal code
        between client and server
      </>
    ),
  },
  {
    title: <>React bindings</>,
    imageUrl: 'img/undraw_react.svg',
    description: (
      <>Use react bindings to decrease code amount with React even more</>
    ),
  },
];

const code = `  import axios from 'axios';
- import thunk from 'redux-thunk';
+ import { handleRequests } from '@redux-requests/core';
+ import { createDriver } from '@redux-requests/axios'; // or another driver


  const FETCH_BOOKS = 'FETCH_BOOKS';
- const FETCH_BOOKS_SUCCESS = 'FETCH_BOOKS_SUCCESS';
- const FETCH_BOOKS_ERROR = 'FETCH_BOOKS_ERROR';
-
- const fetchBooksRequest = () => ({ type: FETCH_BOOKS });
- const fetchBooksSuccess = data => ({ type: FETCH_BOOKS_SUCCESS, data });
- const fetchBooksError = error => ({ type: FETCH_BOOKS_ERROR, error });

- const fetchBooks = () => dispatch => {
-   dispatch(fetchBooksRequest());
-
-   return axios.get('/books').then(response => {
-     dispatch(fetchBooksSuccess(response.data));
-     return response;
-   }).catch(error => {
-     dispatch(fetchBooksError(error));
-     throw error;
-   });
- }

+ const fetchBooks = () => ({
+   type: FETCH_BOOKS,
+   request: {
+     url: '/books',
+     // you can put here other Axios config attributes, like method, data, headers etc.
+   },
+ });

- const defaultState = {
-   data: null,
-   pending: 0, // number of pending FETCH_BOOKS requests
-   error: null,
- };
-
- const booksReducer = (state = defaultState, action) => {
-   switch (action.type) {
-     case FETCH_BOOKS:
-       return { ...defaultState, pending: state.pending + 1 };
-     case FETCH_BOOKS_SUCCESS:
-       return { ...defaultState, data: action.data, pending: state.pending - 1 };
-     case FETCH_BOOKS_ERROR:
-       return { ...defaultState, error: action.error, pending: state.pending - 1 };
-     default:
-       return state;
-   }
- };

  const configureStore = () => {
+   const { requestsReducer, requestsMiddleware } = handleRequests({
+     driver: createDriver(axios),
+   });
+
    const reducers = combineReducers({
-     books: booksReducer,
+     requests: requestsReducer,
    });

    const store = createStore(
      reducers,
-     applyMiddleware(thunk),
+     applyMiddleware(...requestsMiddleware),
    );

    return store;
  };
`;

function Feature({ imageUrl, title, description }) {
  const imgUrl = useBaseUrl(imageUrl);

  return (
    <div className={classnames('col col--4', styles.feature)}>
      {imgUrl && (
        <div classNasme="text--center">
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;
  const showcaseUrl = useBaseUrl('img/showcase.gif');
  const logoUrl = useBaseUrl('img/logo-small.png');

  return (
    <Layout
      title="Home page"
      description="Declarative AJAX requests and automatic network state management for Redux"
    >
      <header className={classnames('hero hero--primary', styles.heroBanner)}>
        <div className="container">
          <div style={{ marginBottom: 16 }}>
            <img
              src={logoUrl}
              alt="logo"
              style={{ width: 100, verticalAlign: 'middle' }}
            />
            <h1
              className="hero__title"
              style={{
                display: 'inline-block',
                verticalAlign: 'middle',
                margin: 0,
              }}
            >
              {siteConfig.title}
            </h1>
          </div>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <div className={styles.buttons}>
            <Link
              className={classnames(
                'button button--outline button--secondary button--lg',
                styles.getStarted,
              )}
              to={useBaseUrl('docs/introduction/motivation')}
            >
              Get started
            </Link>
          </div>
        </div>
      </header>
      <main style={{ padding: 16 }}>
        <div className="container">
          <img src={showcaseUrl} alt="showcase gif" style={{ width: '100%' }} />
        </div>
        {features.length > 0 && (
          <section className={styles.features}>
            <div className="container">
              <div className="row">
                {features.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}
        <div className="container">
          <p>
            With <i>redux-requests</i>, assuming you use <i>axios</i> you could
            refactor a code in the following way:
          </p>
          <Highlight
            {...defaultProps}
            code={code}
            language="diff"
            theme={theme}
          >
            {({ className, style, tokens, getLineProps, getTokenProps }) => (
              <pre
                className={className}
                style={{
                  ...style,
                  padding: 16,
                  fontSize: 14,
                  lineHeight: 1.4,
                }}
              >
                {tokens.map((line, i) => (
                  <div {...getLineProps({ line, key: i })}>
                    {line.map((token, key) => (
                      <span {...getTokenProps({ token, key })} />
                    ))}
                  </div>
                ))}
              </pre>
            )}
          </Highlight>
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <p>Would you like to learn more?</p>
          </div>
          <div className={styles.buttons} style={{ marginBottom: 40 }}>
            <Link
              className={classnames(
                'button button--outline button--secondary button--lg',
                styles.getStarted,
              )}
              to={useBaseUrl('docs/introduction/motivation')}
            >
              Go to documentation
            </Link>
          </div>
        </div>
      </main>
    </Layout>
  );
}

export default Home;
