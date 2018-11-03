import { createAction } from 'redux-act';

export const fetchPhotoAction = createAction('fetch photo', id => ({
  request: { url: `/photos/${id}` },
}));

export const deletePhotoAction = createAction('delete photo', id => ({
  request: { url: `/photos/${id}`, method: 'delete' },
}));

export const clearPhotoAction = createAction('clear photo');

export const fetchPostsAction = createAction('fetch posts', () => ({
  request: { url: '/posts/' },
}));

export const deletePostAction = createAction(
  'delete post',
  id => ({
    request: { url: `/posts/${id}`, method: 'delete' },
  }),
  id => ({ id }),
);

export const clearPostsAction = createAction('clear posts');
