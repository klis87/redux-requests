import { Driver } from 'redux-saga-requests';

type GraphqlDriverConfig = {
  url: string;
};

export const createDriver: (config: GraphqlDriverConfig) => Driver;

export const gql: (query: string) => string;
