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
        </Toolbar>
      </AppBar>
      <Paper style={{ padding: 32 }}>
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
                              setBookRating(book.id, newValue, mode, page),
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
