import { take, put } from 'redux-saga/effects';
import { END } from 'redux-saga';

import {
  getRequestActionFromResponse,
  isRequestAction,
  isResponseAction,
  isSuccessAction,
} from '../actions';

export default function* countServerRequests({
  serverRequestActions,
  finishOnFirstError = true,
}) {
  let index = 0;
  serverRequestActions.requestActionsToIgnore = [];
  serverRequestActions.successActions = [];
  serverRequestActions.dependentSuccessActions = [];
  serverRequestActions.errorActions = [];

  while (true) {
    const action = yield take(a => isRequestAction(a) || isResponseAction(a));

    if (isRequestAction(action)) {
      index +=
        action.meta && action.meta.dependentRequestsNumber !== undefined
          ? action.meta.dependentRequestsNumber + 1
          : 1;
      continue;
    }

    if (!isSuccessAction(action)) {
      serverRequestActions.errorActions.push(action);

      if (finishOnFirstError) {
        yield put(END);
        return;
      }
    } else if (action.meta.isDependentRequest) {
      serverRequestActions.dependentSuccessActions.push(action);
    } else {
      serverRequestActions.successActions.push(action);
    }

    index -= action.meta.isDependentRequest ? 2 : 1;

    if (index === 0) {
      serverRequestActions.requestActionsToIgnore = serverRequestActions.successActions
        .map(getRequestActionFromResponse)
        .map(a => ({ type: a.type }));
      yield put(END);
      return;
    }
  }
}
