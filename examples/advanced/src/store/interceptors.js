import { FETCH_PHOTO } from './constants';
import {
  incrementRequestCounter,
  incrementResponseCounter,
  incrementErrorCounter,
  fetchPhoto,
} from './actions';

export const onRequest = (request, action, store) => {
  store.dispatch(incrementRequestCounter());
  return request;
};

export const onSuccess = (response, action, store) => {
  store.dispatch(incrementResponseCounter());
  return response;
};

export const onError = async (error, action, store) => {
  if (
    error.response &&
    error.response.status === 404 &&
    action.type === FETCH_PHOTO
  ) {
    const response = await store.dispatch({
      ...fetchPhoto(1),
      meta: { silent: true, runOnSuccess: false, runOnRequest: false },
    });

    if (response.data) {
      return { data: response.data };
    }
  }

  store.dispatch(incrementErrorCounter());
  throw error;
};
