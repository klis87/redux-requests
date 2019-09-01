import { call, fork, join, take, race, cancel } from 'redux-saga/effects';

import { isRequestAction, isRequestActionQuery } from '../actions';
import sendRequest from './send-request';

/* eslint-disable */
const delay =
  require('redux-saga').delay || require('@redux-saga/delay-p').default;
/* eslint-enable */

const watchRequestsDefaultConfig = {
  takeLatest: isRequestActionQuery,
  abortOn: null,
  getLastActionKey: action => action.type,
};

export function* cancelSendRequestOnAction(abortOn, task) {
  const { abortingAction } = yield race({
    abortingAction: take(abortOn),
    taskFinished: join(task),
    timeout: call(delay, 10000), // taskFinished doesnt work for aborted tasks
  });

  if (abortingAction) {
    yield cancel(task);
  }
}

const isWatchable = a =>
  isRequestAction(a) && (!a.meta || a.meta.runByWatcher !== false);

export default function* watchRequests(commonConfig = {}) {
  const lastTasks = {};
  const config = { ...watchRequestsDefaultConfig, ...commonConfig };

  while (true) {
    const action = yield take(isWatchable);
    const lastActionKey = config.getLastActionKey(action);
    const takeLatest =
      action.meta && action.meta.takeLatest !== undefined
        ? action.meta.takeLatest
        : typeof config.takeLatest === 'function'
        ? config.takeLatest(action)
        : config.takeLatest;

    if (takeLatest) {
      const activeTask = lastTasks[lastActionKey];

      if (activeTask) {
        yield cancel(activeTask);
      }
    }

    const newTask = yield fork(sendRequest, action);

    if (takeLatest) {
      lastTasks[lastActionKey] = newTask;
    }

    const abortOn =
      action.meta && action.meta.abortOn ? action.meta.abortOn : config.abortOn;

    if (abortOn) {
      yield fork(cancelSendRequestOnAction, abortOn, newTask);
    }
  }
}
