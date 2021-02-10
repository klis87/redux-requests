import { Driver, Subscriber } from '@redux-requests/core';

interface GraphqlDriverConfig {
  url: string;
}

export const createDriver: (config: GraphqlDriverConfig) => Driver;

export const createSubscriber: (config: {
  url: string;
  WS?: any;
  lazy?: boolean;
  heartbeatTimeout?: number;
  reconnectTimeout?: number;
  useHeartbeat?: boolean;
}) => Subscriber;

export const gql: (
  query: TemplateStringsArray,
  ...args: (string | number)[]
) => string;
