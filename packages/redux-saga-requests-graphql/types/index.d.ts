import { Driver } from 'redux-saga-requests';

interface GraphqlDriverConfig {
  url: string;
}

export const createDriver: (config: GraphqlDriverConfig) => Driver;

export const gql: (query: string | TemplateStringsArray) => string;
