import React, { useState } from 'react';
import { clearRequestsCache } from '@redux-requests/core';
import { Query, Mutation } from '@redux-requests/react';
import { useDispatch } from 'react-redux';
import {
  Paper,
  Typography,
  Grid,
  AppBar,
  Toolbar,
  Tabs,
  Tab,
} from '@material-ui/core';
import { Pagination, Rating } from '@material-ui/lab';

import { fetchBooks, setBookRating } from '../store/actions';
import { FETCH_BOOKS } from '../store/constants';
import Spinner from './spinner';
import CodeTooltip from './code-tooltip';

const code0 = `const fetchBooks = (page = 1) => ({
  type: FETCH_BOOKS,
  request: {
    url: '/books',
    params: {
      page,
    },
  },
});

const setBookRating = (id, rating) => ({
  type: SET_BOOK_RATING,
  request: {
    url: \`/books/\${id}/rating/\${rating}\`,
    method: 'post',
  },
  meta: {
    mutations: {
      [FETCH_BOOKS]: (data, mutationData) =>
        data.map(v => (v.id === mutationData.id ? mutationData : v)),
    },
  },
});`;

const code1 = `const fetchBooks = (page = 1) => ({
  type: FETCH_BOOKS,
  request: {
    url: '/books',
    params: {
      page,
    },
  },
  meta: {
    cache: 10,
    cacheKey: String(page),
  },
});

const setBookRating = (id, rating) => ({
  type: SET_BOOK_RATING,
  request: {
    url: \`/books/\${id}/rating/\${rating}\`,
    method: 'post',
  },
  meta: {
    mutations: {
      [FETCH_BOOKS]: (data, mutationData) =>
        data.map(v => (v.id === mutationData.id ? mutationData : v)),
    },
  },
});`;

const code2 = `const fetchBooks = (page = 1) => ({
  type: FETCH_BOOKS,
  request: {
    url: '/books',
    params: {
      page,
    },
  },
  meta: {
    cache: 10,
    requestKey: String(page),
    requestsCapacity: 3,
  },
});

const setBookRating = (id, rating, page) => ({
  type: SET_BOOK_RATING,
  request: {
    url: \`/books/\${id}/rating/\${rating}\`,
    method: 'post',
  },
  meta: {
    mutations: {
      [FETCH_BOOKS + String(page)]: (data, mutationData) =>
        data.map(v => (v.id === mutationData.id ? mutationData : v)),
    },
  },
});`;

const Books = () => {
  const dispatch = useDispatch();
  const [page, changePage] = useState(1);
  const [mode, setMode] = useState(0);

  return (
    <div>
      <AppBar position="static" color="primary">
        <Toolbar style={{ minHeigh: 'auto' }} variant="dense">
          <Typography color="inherit" variant="h6" style={{ marginRight: 32 }}>
            Books
          </Typography>
          <div style={{ flexGrow: 1 }}>
            <Tabs
              value={mode}
              onChange={(e, value) => {
                setMode(value);
                dispatch(clearRequestsCache()); // for demo to work
                dispatch(fetchBooks(page, value));
              }}
              variant="fullWidth"
            >
              <Tab label="Basic" />
              <Tab label="Cache single page" />
              <Tab label="Cache last 3 pages" />
            </Tabs>
          </div>
          <CodeTooltip code={mode === 0 ? code0 : mode === 1 ? code1 : code2} />
        </Toolbar>
      </AppBar>
      <Paper style={{ padding: 32 }}>
        <Typography paragraph>
          Try to change pages quickly, notice in devtools that previous pending
          requests are automatically aborted.
        </Typography>
        <Typography paragraph>
          Check <b>CACHE SINGLE PAGE</b> tab, try to click the selected page
          after data is already fetched, for 10 seconds no request will be made,
          as the last page is cached.
        </Typography>
        <Typography paragraph>
          Check <b>CACHE LAST 3 PAGES</b> tab, try to play and for instance
          select 2, 3, 4, 2, 3, 4... For 10 seconds for last 3 pages no request
          will be made, as last 3 pages are cached.
        </Typography>
        <Pagination
          count={9}
          page={page}
          onChange={(_, p) => {
            changePage(p);
            dispatch(fetchBooks(p, mode));
          }}
          style={{ marginBottom: 16 }}
        />
        <Query
          type={FETCH_BOOKS}
          requestKey={mode === 2 ? String(page) : undefined}
          loadingComponent={Spinner}
        >
          {({ data }) => (
            <div>
              <Grid container spacing={1}>
                {data.map(book => {
                  return (
                    <Grid key={book.id} item xs={12} sm={6} md={4} lg={3}>
                      <Paper style={{ padding: 8 }}>
                        <Rating
                          value={book.rating}
                          onChange={(event, newValue) => {
                            dispatch(
                              setBookRating(
                                book.id,
                                newValue,
                                mode,
                                page,
                                'invalidToken',
                              ),
                            );
                          }}
                        />
                        <Typography variant="h6">{book.title}</Typography>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </div>
          )}
        </Query>
      </Paper>
    </div>
  );
};

export default Books;
