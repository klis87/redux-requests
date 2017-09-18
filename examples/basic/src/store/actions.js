import { FETCH_POSTS } from './constants';

export const fetchPosts = () => ({
  type: FETCH_POSTS,
  request: { url: 'https://jsonplaceholder.typicode.com/posts' },
});
