---
id: usage
title: Usage
---

Before we go further, let's start with some naming conventions explanation and ideas behind this library.

As you probably noticed in `Motivation` section, one of the used pieces are actions with `request` key.
Let's call them request actions from now. If such an action is dispatched, it will cause an AJAX request
to be fired automatically. Then, depending on the outcome, either corresponding success, error, or abort action will
be dispatched. In the next paragraphs there will be more information about request actions, but for now
know, that request actions are powered by so called drivers. You set drivers in `handleRequest` function. There are
officially supported Axios, Fetch API, GraphQL and mock drivers, but it is very easy to write your own driver.
Just pick whatever you prefer. The key to understand is that if you know how to use Fetch API,
you know how to use Fetch API driver. A config object you would pass to `fetch` function,
now you attach to `request` key inside a request action. Another information which will
be explained later is that you can use `meta` key next to `request`, which is the way to pass some additional options.
One of examples can be `meta.driver` option, which allows you to define driver per request action, that's it,
you can use multiple drivers within one application. It will be described later, for now let's focus on core concepts.

Another important thing is that we can divide `requests` into `queries` and `mutations`.
This is just a naming convention used in this library, borrowed from graphql.
Just remember, that `query` is a request fired to get some data, while `mutation` is a request fired
to cause some side effect, including data update. Or to think about it from different perspective,
if you use REST, usually a query will be a `GET`, `HEAD`, `OPTIONS` request,
and mutation will be a `POST`, `PUT`, `PATCH`, `DELETE` request. Of course, if you use
graphql, no explanation is necessary.

Now, as naming convention is clarified, let's leave actions for now and focus on reducers.
As shown in `Motivation` example, `handleRequests` returns ready to use `requestsReducer`,
which manages all your remote state kept in one place. It does not mean that you cannot
react on requests actions in your own reducers, but most of the time it won't be required.

So, the whole remote state is kept inside one reducer, as one big object attached to `requests` key
in `state`. However, you should not read this state directly in your application, but you should use
selectors provided by this library. Why? Because they are very optimized with the use of `reselect` already,
plus state in requests reducer contains some information which should be treated as an internal implementation
detail, not needed to be understood or used by users of this library. Selectors will be explained in a dedicated chapter,
for now just know that there are selectors `getQuery`, `getMutation` as well as selector creators `getQuerySelector`
and `getMutationSelector`.

Also, probably you noticed sagas. Actually you don't need to know or use sagas in your application! You only need to do
what is shown in `Motivation` part. However, this library is completely compatible with it, actually it uses sagas
to power some of its functionalities. It might be possible though that one of the next releases will be rewritten to get rid
of `redux-saga` dependency, it shouldn't change this library API, just know this as a curiosity.
