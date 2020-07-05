---
title:  handleRequests
---

As you probably noticed in other chapters, `handleRequests` is a function which gets some options
and returns object with the following keys:
- `requestsReducer`: ready to use reducer managing the whole remote state, you need to attach it
to `requests` key in `combineReducers`
- `requestsMiddleware`: list of middleware you should pass to `applyMiddleware`
- `requestsPromise`: promise which is resolved after all requests are finished, only with `ssr: 'server'` option

Below you can see all available options for `handleRequests`:
- `driver`: the only option which is required, a driver or object of drivers if you use multiple drivers
- `onRequest`: see interceptors
- `onSuccess`: see interceptors
- `onError`: see interceptors
- `onAbort`: see interceptors
- `cache`: see Cache middleware
- `ssr`: see Server side rendering middleware
- `isRequestAction: (action: AnyAction) => boolean`: here you can adjust which actions are treated
as request actions, usually you don't need to worry about it, might be useful for custom drivers
- `isRequestActionQuery: (requestAction: RequestAction) => boolean`: if this function returns true,
request action is treated as query, if false, as mutation, probably only useful for custom drivers
- `takeLatest: boolean || (action: requestAction) => boolean`: if true, pending requests of a given type
are automatically cancelled if a new request of a given type is fired, by default queries are run as `takeLatest: true`
and mutations as `takeLatest: false`
- `normalize`: by default `false`, see normalisation
- `getNormalisationObjectKey`: see normalisation
- `shouldObjectBeNormalized`: see normalisation
