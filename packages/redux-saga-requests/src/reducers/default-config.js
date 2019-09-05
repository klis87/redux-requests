export default {
  getData: (state, action) =>
    action.payload ? action.payload.data : action.data,
  getError: (state, action) => (action.payload ? action.payload : action.error),
  resetOn: [],
};
