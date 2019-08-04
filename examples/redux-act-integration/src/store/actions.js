import { createAction } from 'redux-act';

export const clearPhotoAction = createAction('clear photo');

export const fetchPhotoAction = createAction(
  'fetch photo',
  id => ({
    request: { url: `/photos/${id}` },
  }),
  () => ({
    abortOn: clearPhotoAction,
    resetOn: [clearPhotoAction],
  }),
);

export const deletePhotoAction = createAction(
  'delete photo',
  id => ({
    request: { url: `/photos/${id}`, method: 'delete' },
  }),
  () => ({
    operations: {
      [fetchPhotoAction]: () => null,
    },
  }),
);

export const clearPostsAction = createAction('clear posts');

export const fetchPostsAction = createAction(
  'fetch posts',
  () => ({
    request: { url: '/posts/' },
  }),
  () => ({
    abortOn: clearPostsAction,
    resetOn: [clearPostsAction],
  }),
);

export const deletePostAction = createAction(
  'delete post',
  id => ({
    request: { url: `/posts/${id}`, method: 'delete' },
  }),
  id => ({
    id,
    operations: {
      getRequestKey: action => String(action.meta.id),
      [fetchPostsAction]: {
        updateData: (state, action) =>
          state.data.filter(v => v.id !== action.meta.id),
      },
    },
  }),
);
