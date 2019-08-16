import { createAction } from 'redux-act';

export const clearPhoto = createAction('clear photo');

export const fetchPhoto = createAction(
  'fetch photo',
  id => ({
    request: { url: `/photos/${id}` },
  }),
  () => ({
    abortOn: clearPhoto,
    resetOn: [clearPhoto],
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

export const clearPosts = createAction('clear posts');

export const fetchPosts = createAction(
  'fetch posts',
  () => ({
    request: { url: '/posts/' },
  }),
  () => ({
    abortOn: clearPosts,
    resetOn: [clearPosts],
  }),
);

export const deletePost = createAction(
  'delete post',
  id => ({
    request: { url: `/posts/${id}`, method: 'delete' },
  }),
  id => ({
    id,
    mutations: {
      getRequestKey: action => String(action.meta.id),
      [fetchPosts]: {
        updateData: (state, action) =>
          state.data.filter(v => v.id !== action.meta.id),
      },
    },
  }),
);
