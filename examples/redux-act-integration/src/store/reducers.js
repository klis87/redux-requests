import { abort } from 'redux-saga-requests';
import { createReducer } from 'redux-act';

import { fetchPhoto, fetchPosts } from './actions';

const increment = number => number + 1;

export const abortCounterReducer = createReducer(
  {
    [abort(fetchPhoto)]: increment,
    [abort(fetchPosts)]: increment,
  },
  0,
);
