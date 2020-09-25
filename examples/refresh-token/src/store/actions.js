import {
  FETCH_BOOKS,
  SET_BOOK_RATING,
  FETCH_POSTS,
  LIKE_POST,
  UNLIKE_POST,
  REORDER_POSTS,
  FETCH_GROUPS,
  FOLLOW_USER,
  UNFOLLOW_USER,
} from './constants';

export const fetchBooks = (page = 1, mode = 0) => ({
  type: FETCH_BOOKS,
  request: {
    url: '/books',
    params: {
      page,
    },
  },
  meta: {
    cache: mode === 0 ? undefined : 10,
    cacheKey: mode === 1 ? String(page) : undefined,
    requestKey: mode === 2 ? String(page) : undefined,
    requestsCapacity: 3,
  },
});

export const setBookRating = (id, rating, mode, page, token) => ({
  type: SET_BOOK_RATING,
  request: {
    url: `/books/${id}/rating/${rating}`,
    method: 'post',
    params: {
      token,
    },
  },
  meta: {
    mutations: {
      [FETCH_BOOKS + (mode === 2 ? String(page) : '')]: (data, mutationData) =>
        data.map(v => (v.id === mutationData.id ? mutationData : v)),
    },
  },
});

export const fetchPosts = () => ({
  type: FETCH_POSTS,
  request: {
    url: '/posts',
  },
});

export const likePost = (id, optimistic) => ({
  type: LIKE_POST,
  request: {
    url: `/posts/${id}/like`,
    method: 'post',
  },
  meta: {
    requestKey: id,
    mutations: {
      [FETCH_POSTS]: {
        updateData: !optimistic
          ? data =>
              data.map(v => (v.id === id ? { ...v, likes: v.likes + 1 } : v))
          : undefined,
        updateDataOptimistic: optimistic
          ? data =>
              data.map(v => (v.id === id ? { ...v, likes: v.likes + 1 } : v))
          : undefined,
        revertData: optimistic
          ? data =>
              data.map(v => (v.id === id ? { ...v, likes: v.likes - 1 } : v))
          : undefined,
      },
    },
  },
});

export const unlikePost = (id, optimistic) => ({
  type: UNLIKE_POST,
  request: {
    url: `/posts/${id}/unlike`,
    method: 'post',
  },
  meta: {
    requestKey: id,
    mutations: {
      [FETCH_POSTS]: {
        updateData: !optimistic
          ? data =>
              data.map(v => (v.id === id ? { ...v, likes: v.likes - 1 } : v))
          : undefined,
        updateDataOptimistic: optimistic
          ? data =>
              data.map(v => (v.id === id ? { ...v, likes: v.likes - 1 } : v))
          : undefined,
        revertData: optimistic
          ? data =>
              data.map(v => (v.id === id ? { ...v, likes: v.likes + 1 } : v))
          : undefined,
      },
    },
  },
});

export const reorderPosts = (newIds, currentIds, optimistic) => ({
  type: REORDER_POSTS,
  request: {
    url: '/posts/reorder',
    method: 'post',
    data: {
      ids: newIds,
    },
  },
  meta: {
    mutations: {
      [FETCH_POSTS]: {
        updateData: !optimistic
          ? (data, mutationData) => mutationData
          : undefined,
        updateDataOptimistic: optimistic
          ? data => newIds.map(id => data.find(v => v.id === id))
          : undefined,
        revertData: optimistic
          ? data => currentIds.map(id => data.find(v => v.id === id))
          : undefined,
      },
    },
  },
});

export const fetchGroups = () => ({
  type: FETCH_GROUPS,
  request: {
    url: '/groups',
  },
  meta: {
    normalize: true,
  },
});

export const followUser = id => ({
  type: FOLLOW_USER,
  request: {
    url: `/groups/${id}/follow`,
    method: 'post',
  },
  meta: {
    normalize: true,
  },
});

export const unfollowUser = id => ({
  type: UNFOLLOW_USER,
  request: {
    url: `/groups/${id}/unfollow`,
    method: 'post',
  },
  meta: {
    normalize: true,
  },
});
