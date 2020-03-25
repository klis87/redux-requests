import { Driver } from 'redux-saga-requests';

export const createDriver: ({
  AbortController,
}: {
  AbortController?: AbortController;
}) => Driver;
