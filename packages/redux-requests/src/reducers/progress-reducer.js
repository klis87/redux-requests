import { SET_DOWNLOAD_PROGRESS, SET_UPLOAD_PROGRESS } from '../constants';
import { isRequestAction } from '../actions';

export default (state, action) => {
  if (action.type === SET_DOWNLOAD_PROGRESS) {
    return {
      ...state,
      downloadProgress: {
        ...state.downloadProgress,
        [action.requestType]: action.progress,
      },
    };
  }

  if (action.type === SET_UPLOAD_PROGRESS) {
    return {
      ...state,
      uploadProgress: {
        ...state.uploadProgress,
        [action.requestType]: action.progress,
      },
    };
  }

  if (isRequestAction(action) && action.meta.measureDownloadProgress) {
    return {
      ...state,
      downloadProgress: {
        ...state.downloadProgress,
        [action.type + (action.meta.requestKey || '')]: 0,
      },
    };
  }

  if (isRequestAction(action) && action.meta.measureUploadProgress) {
    return {
      ...state,
      uploadProgress: {
        ...state.uploadProgress,
        [action.type + (action.meta.requestKey || '')]: 0,
      },
    };
  }

  return state;
};
