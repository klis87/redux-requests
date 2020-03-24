import Axios from 'axios';
import { FETCH_PHOTO, FETCH_POST } from './constants';

export const fetchPhoto = id => ({
  type: FETCH_PHOTO,
  request: {
    promise: Axios.get(
      `https://jsonplaceholder.typicode.com/photos/${id}`,
    ).then(response => {
      return response.data;
    }),
  },
});

export const fetchPost = id => ({
  type: FETCH_POST,
  request: [
    {
      promise: Axios.get(
        `https://jsonplaceholder.typicode.com/posts/${id}`,
      ).then(response => {
        return response.data;
      }),
    },
    {
      promise: Axios.get(
        `https://jsonplaceholder.typicode.com/posts/${id}/comments`,
      ).then(response => {
        return response.data;
      }),
    },
  ],
  meta: {
    getData: data => ({
      ...data[0],
      comments: data[1],
    }),
  },
});
