import { createDriver, gql } from './index';

const graphqlDriver = createDriver({ url: '/', withCredentials: false });

gql`query`;
gql`query ${1} ${'1'}`;
