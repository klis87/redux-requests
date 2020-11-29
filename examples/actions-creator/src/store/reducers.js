import { abort } from '@redux-requests/core';
import { createReducer } from 'redux-smart-actions';

import { fetchPhoto, fetchPosts } from './actions';

const increment = number => number + 1;

export const abortCounterReducer = createReducer(
  {
    [abort(fetchPhoto)]: increment,
    [abort(fetchPosts)]: increment,
  },
  0,
);
