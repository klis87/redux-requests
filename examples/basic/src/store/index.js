import { createStore, applyMiddleware, combineReducers, compose } from "redux";
import axios from "axios";
import { handleRequests } from "@redux-requests/core";
import { createDriver } from "@redux-requests/axios";

// configureStore is used to create the store and configure it with the reducers and middleware
export const configureStore = () => {
  const { requestsReducer, requestsMiddleware } = handleRequests({
    driver: createDriver(
      axios.create({
        baseURL: "https://jsonplaceholder.typicode.com",
      })
    ),
  });

  // combineReducers is used to combine multiple reducers into one reducer
  const reducers = combineReducers({
    requests: requestsReducer,
  });

  // compose is used to apply multiple middlewares to the store
  const composeEnhancers =
    (typeof window !== "undefined" &&
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
    compose;

  // createStore is used to create the store and apply middleware to it to handle the requests
  const store = createStore(
    reducers,
    composeEnhancers(applyMiddleware(...requestsMiddleware))
  );

  return store;
};
