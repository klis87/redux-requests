import {
  FETCH_PHOTO,
  DELETE_PHOTO,
  DELETE_PHOTO_OPTIMISTIC,
  FETCH_POSTS,
  DELETE_POST,
  DELETE_POST_OPTIMISTIC,
} from './constants';

export const fetchPhoto = id => ({
  type: FETCH_PHOTO,
  request: { url: `/photos/${id}` },
});

export const deletePhoto = id => ({
  type: DELETE_PHOTO,
  request: {
    url: `/photos/${id}`,
    method: 'delete',
  },
  meta: {
    operations: {
      [FETCH_PHOTO]: () => null,
    },
  },
});

export const deletePhotoOptimistic = photo => ({
  type: DELETE_PHOTO_OPTIMISTIC,
  request: {
    url: `/photos/${photo.id}`,
    method: 'delete',
  },
  meta: {
    deletedPhoto: photo,
    operations: {
      [FETCH_PHOTO]: {
        updateDataOptimistic: () => null,
        revertData: (state, action) => action.meta.deletedPhoto,
      },
    },
  },
});

export const fetchPosts = () => ({
  type: FETCH_POSTS,
  request: { url: '/posts' },
});

export const deletePost = id => ({
  type: DELETE_POST,
  request: {
    url: `/posts/${id}`,
    method: 'delete',
  },
  meta: {
    id,
    operations: {
      getRequestKey: action => String(action.meta.id),
      [FETCH_POSTS]: {
        updateData: (state, action) =>
          state.data.filter(v => v.id !== action.meta.id),
      },
    },
  },
});

export const deletePostOptimistic = post => ({
  type: DELETE_POST_OPTIMISTIC,
  request: {
    url: `/posts/${post.id}`,
    method: 'delete',
  },
  meta: {
    deletedPost: post,
    operations: {
      getRequestKey: action => String(action.meta.deletedPost.id),
      [FETCH_POSTS]: {
        updateDataOptimistic: (state, action) =>
          state.data.filter(v => v.id !== action.meta.deletedPost.id),
        revertData: (state, action) => [action.meta.deletedPost, ...state.data],
      },
    },
  },
});
