import { createDriver, gql } from './index';

const graphqlDriver = createDriver({ url: '/' });
graphqlDriver.getSuccessPayload({}, {});
graphqlDriver.getErrorPayload({});

gql('query');
