import { createDriver, gql } from './index';

const graphqlDriver = createDriver({ url: '/' });

gql`query`;
gql`query ${1} ${'1'}`;
