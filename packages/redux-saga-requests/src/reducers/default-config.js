export default {
  getData: (data, action) =>
    action.payload ? action.payload.data : action.data,
  getError: (error, action) => (action.payload ? action.payload : action.error),
};
