import { abort } from 'redux-saga-requests';
import { createReducer } from 'redux-act';

import { fetchPhotoAction, fetchPostsAction } from './actions';

const increment = number => number + 1;

export const abortCounterReducer = createReducer(
  {
    [abort(fetchPhotoAction)]: increment,
    [abort(fetchPostsAction)]: increment,
  },
  0,
);
