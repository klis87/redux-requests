import { createAction } from 'redux-smart-actions';

export const fetchPhoto = createAction('fetch photo', id => ({
  request: { url: `/photos/${id}` },
}));

export const deletePhoto = createAction('delete photo', id => ({
  request: { url: `/photos/${id}`, method: 'delete' },
  meta: {
    mutations: { [fetchPhoto]: () => null },
  },
}));

export const fetchPosts = createAction('fetch posts', () => ({
  request: { url: '/posts/' },
}));

export const deletePost = createAction('delete post', id => ({
  request: { url: `/posts/${id}`, method: 'delete' },
  meta: {
    requestKey: String(id),
    mutations: {
      [fetchPosts]: {
        updateData: data => data.filter(v => v.id !== id),
      },
    },
  },
}));
