import { createAction } from 'redux-act';

export const clearPhotoAction = createAction('clear photo');

export const fetchPhotoAction = createAction(
  'fetch photo',
  id => ({
    request: { url: `/photos/${id}` },
  }),
  () => ({ abortOn: clearPhotoAction }),
);

export const deletePhotoAction = createAction('delete photo', id => ({
  request: { url: `/photos/${id}`, method: 'delete' },
}));

export const clearPostsAction = createAction('clear posts');

export const fetchPostsAction = createAction(
  'fetch posts',
  () => ({
    request: { url: '/posts/' },
  }),
  () => ({ abortOn: clearPostsAction }),
);

export const deletePostAction = createAction(
  'delete post',
  id => ({
    request: { url: `/posts/${id}`, method: 'delete' },
  }),
  id => ({ id }),
);
