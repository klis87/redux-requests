import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Query from './query';

const emptyQuery = {
  data: null,
  error: null,
  pending: 0,
};

const ConnectedQuery = connect(
  (state, ownProps) => ({
    query: ownProps.requestSelector
      ? ownProps.requestSelector(state)
      : state.network.queries[ownProps.type] || emptyQuery,
  }),
  null,
  (stateProps, dispatchProps, { requestSelector, type, ...ownProps }) => ({
    ...ownProps,
    ...stateProps,
    ...dispatchProps,
  }),
)(Query);

const { query, ...commonQueryProps } = Query.propTypes;

ConnectedQuery.propTypes /* remove-proptypes */ = {
  ...commonQueryProps,
  requestSelector: PropTypes.func,
  type: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
};

export default ConnectedQuery;
