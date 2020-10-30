export default store => {
  return {
    ...store,
    dispatchRequest: store.dispatch,
  };
};
