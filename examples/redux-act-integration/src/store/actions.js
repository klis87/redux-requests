import { getActionWithSuffix } from 'redux-saga-requests';
import { createAction } from 'redux-act';

export const success = getActionWithSuffix(' success');
export const error = getActionWithSuffix(' error');
export const abort = getActionWithSuffix(' abort');

export const fetchPosts = createAction('fetch posts', (timeout = null) => {
  return {
    request: { url: '/posts', timeout },
  };
});

export const clearPosts = createAction('clear posts');
