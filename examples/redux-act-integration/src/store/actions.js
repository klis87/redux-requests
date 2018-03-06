import { getActionWithSuffix } from 'redux-saga-requests';
import { createAction } from 'redux-act';

export const success = getActionWithSuffix(' success');
export const error = getActionWithSuffix(' error');
export const abort = getActionWithSuffix(' abort');

export const fetchPhoto = createAction('fetch photo', id => ({
  request: { url: `/photos/${id}` },
}));

export const clearPhoto = createAction('clear photo');

export const fetchPost = createAction('fetch post', id => ({
  requests: [{ url: `/posts/${id}` }, { url: `/posts/${id}/comments` }],
}));

export const clearPost = createAction('clear post');
export const cancelFetchPost = createAction('cancel fetch post');
