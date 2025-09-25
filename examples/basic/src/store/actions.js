import { FETCH_PHOTO, FETCH_POST } from "./constants";

// FetchPhoto action is used to fetch photo from the server
export const fetchPhoto = (id) => ({
  type: FETCH_PHOTO,
  request: { url: `/photos/${id}` },
});

// fetchPost action is used to fetch post from the server with the given id
export const fetchPost = (id) => ({
  type: FETCH_POST,
  request: [{ url: `/posts/${id}` }, { url: `/posts/${id}/comments` }],
  meta: {
    // meta is used to pass extra information to the reducer
    getData: (data) => ({
      ...data[0],
      comments: data[1],
    }),
  },
});
