import { createAction } from 'redux-act';

export const fetchPhoto = createAction('fetch photo', id => ({
  request: { url: `/photos/${id}` },
}));

export const clearPhoto = createAction('clear photo');

export const fetchPost = createAction('fetch post', id => ({
  request: [{ url: `/posts/${id}` }, { url: `/posts/${id}/comments` }],
}));

export const clearPost = createAction('clear post');
