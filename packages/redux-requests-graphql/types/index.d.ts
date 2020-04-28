import { Driver } from '@redux-requests/core';

interface GraphqlDriverConfig {
  url: string;
}

export const createDriver: (config: GraphqlDriverConfig) => Driver;

export const gql: (
  query: TemplateStringsArray,
  ...args: (string | number)[]
) => string;
