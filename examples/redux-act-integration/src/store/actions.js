import { createAction } from 'redux-act';

export const abortPhoto = createAction('abort photo');

export const fetchPhoto = createAction(
  'fetch photo',
  id => ({
    request: { url: `/photos/${id}` },
  }),
  () => ({
    abortOn: abortPhoto,
  }),
);

export const deletePhoto = createAction(
  'delete photo',
  id => ({
    request: { url: `/photos/${id}`, method: 'delete' },
  }),
  () => ({
    mutations: {
      [fetchPhoto]: () => null,
    },
  }),
);

export const abortPosts = createAction('abort posts');

export const fetchPosts = createAction(
  'fetch posts',
  () => ({
    request: { url: '/posts/' },
  }),
  () => ({
    abortOn: abortPosts,
  }),
);

export const deletePost = createAction(
  'delete post',
  id => ({
    request: { url: `/posts/${id}`, method: 'delete' },
  }),
  id => ({
    requestKey: String(id),
    mutations: {
      [fetchPosts]: {
        updateData: data => data.filter(v => v.id !== id),
      },
    },
  }),
);
